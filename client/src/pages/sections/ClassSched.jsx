import { useState, useEffect, useRef } from "react";
import { getSubjects } from "../../services/subjects";
import { toPng } from "html-to-image";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/themeContext";
import LoadingIcon from "../../components/ui/LoadingIcon";
import CvSULogo from "../../assets/images/CvSU-logo.png";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];
const TIME_LABELS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const COLORS = [
  "bg-cyan-100 dark:bg-cyan-900/40", "bg-yellow-100 dark:bg-yellow-900/40", "bg-green-100 dark:bg-green-900/40", "bg-orange-100 dark:bg-orange-900/40",
  "bg-pink-100 dark:bg-pink-900/40", "bg-purple-100 dark:bg-purple-900/40", "bg-red-100 dark:bg-red-900/40", "bg-blue-100 dark:bg-blue-900/40",
];

const TEXT_COLORS = [
  "text-cyan-800 dark:text-cyan-200", "text-yellow-800 dark:text-yellow-200", "text-green-800 dark:text-green-200", "text-orange-800 dark:text-orange-200",
  "text-pink-800 dark:text-pink-200", "text-purple-800 dark:text-purple-200", "text-red-800 dark:text-red-200", "text-blue-800 dark:text-blue-200",
];

function ClassSched() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingMobile, setDownloadingMobile] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingMobile, setIsExportingMobile] = useState(false);
  const scheduleRef = useRef(null);
  const scheduleRefMobile = useRef(null);
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = sectionRef.current.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [subjects]);

  const handleDownload = async () => {
    if (!scheduleRef.current) return;
    setDownloading(true);
    setIsExporting(true);

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    try {
      const dataUrl = await toPng(scheduleRef.current);
      const link = document.createElement("a");
      link.download = "BSCS-2A-Class-Schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsExporting(false);
      setDownloading(false);
    }
  };

  const handleDownloadMobile = async () => {
    if (!scheduleRefMobile.current) return;
    setDownloadingMobile(true);
    setIsExportingMobile(true);

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    try {
      const dataUrl = await toPng(scheduleRefMobile.current);
      const link = document.createElement("a");
      link.download = "BSCS-2A-Class-Schedule-Wallpaper.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsExportingMobile(false);
      setDownloadingMobile(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const to24hr = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const scheduleData = subjects.flatMap((subject) =>
    (subject.schedules || []).map((sched) => ({
      code: subject.code,
      name: subject.name,
      day: sched.day,
      startTime: sched.startTime,
      endTime: sched.endTime,
      room: sched.room,
    }))
  );

  const getColorIndex = (code) => subjects.findIndex((s) => s.code === code);

  const getSubjectAt = (day, slot) =>
    scheduleData.find(
      (s) =>
        s.day === day &&
        slot >= to24hr(s.startTime) &&
        slot < to24hr(s.endTime)
    ) || null;

  const isStart = (subject, slot) =>
    subject && to24hr(subject.startTime) === slot;

  const getSlotSpan = (subject) => {
    if (!subject) return 1;
    const start = to24hr(subject.startTime);
    const end = to24hr(subject.endTime);
    return TIME_SLOTS.filter((slot) => slot >= start && slot < end).length;
  };

  return (
    <section ref={sectionRef} className="min-h-screen p-4 sm:p-5 lg:px-20" id="class-sched">
      <header className="mt-3 mb-6">
        <p className="animate-on-scroll font-bold text-[1.5rem] md:text-[1.7rem] font-[montserrat] leading-7 text-gray-900 dark:text-gray-100">
          Class Schedule
        </p>
        <p className="animate-on-scroll text-sm sm:text-base text-gray-500 dark:text-[#E0E0E0]">
          Keep track of your classes and never miss an important session.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-165 text-gray-400 dark:text-[#E0E0E0] bg-white dark:bg-[#1a1a1a] text-sm">
          <LoadingIcon dimensions="w-10 h-10" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-[#1a1a1a] [-webkit-overflow-scrolling:touch]">
            <div ref={scheduleRef} className="min-w-290 bg-white dark:bg-[#1a1a1a]">

              <div className="flex flex-row items-center justify-between bg-white dark:bg-[#1a1a1a]">
                <p className={`${isExporting ? "block" : "hidden"} font-bold text-[1.5rem] text-black dark:text-white p-3 bg-white dark:bg-[#1a1a1a]`}> BSCS-2A | 1<sup>st</sup> Semester A.Y. 2026-2027</p>

                <div className={`${isExporting ? "block" : "hidden"} flex items-center p-3 bg-white dark:bg-[#1a1a1a]`}>
                  <img src={CvSULogo} alt="CvSU Logo" className="w-8 h-7"></img>
                  <p className="text-black dark:text-white font-semibold text-[1rem] ml-2">Cavite State University - Imus campus</p>
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="animate-on-scroll bg-[#1B651B] text-white border border-gray-300 dark:border-[#444444] p-2 text-xs w-24">
                      TIME
                    </th>
                    {DAYS.map((d) => (
                      <th
                        key={d}
                        className="animate-on-scroll bg-[#F5F5F5] dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#2b2b2b] text-black dark:text-gray-200 text-xs uppercase w-32 p-3"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1a1a1a]">
                  {TIME_SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="animate-on-scroll border border-gray-300 dark:border-[#444444] py-3 text-center text-xs font-bold text-gray-500 dark:text-[#E0E0E0] bg-gray-50 dark:bg-[#1a1a1a] w-24 whitespace-nowrap px-2">
                        <div>{TIME_LABELS[si]}</div>
                        {TIME_LABELS[si + 1] && (
                          <div className="text-[10px] font-normal opacity-60">
                            – {TIME_LABELS[si + 1]}
                          </div>
                        )}
                      </td>
                      {DAYS.map((d) => {
                        const subject = getSubjectAt(d, slot);
                        const start = isStart(subject, slot);

                        if (subject && !start) return null;

                        if (!subject) {
                          return (
                            <td
                              key={d}
                              className="border border-gray-300 dark:border-[#444444] w-32"
                            />
                          );
                        }

                        const colorIdx = getColorIndex(subject.code);
                        const bgColor = colorIdx >= 0 ? COLORS[colorIdx % COLORS.length] : "";
                        const textColor = colorIdx >= 0 ? TEXT_COLORS[colorIdx % TEXT_COLORS.length] : "";
                        const span = getSlotSpan(subject);

                        return (
                          <td
                            key={d}
                            rowSpan={span}
                            className={`animate-on-scroll border border-gray-300 dark:border-[#444444] w-32 text-left text-xs font-bold align-top ${bgColor}`}
                          >
                            <div className={`animate-on-scroll mt-2 px-2 ${textColor}`}>
                              <p className="font-bold">{subject.code}</p>
                              <p className={`text-[10px] ${subject.room?.toUpperCase() === "ASYNC" ? "text-red-500 font-bold" : subject.room?.toUpperCase() === "TBA" ? "text-amber-400 font-semibold" : "font-normal opacity-70"}`}>{subject.room}</p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallpaper version — never shown in the UI, exists only to be captured by html-to-image */}
          <div className="fixed left-[-9999px] top-0" aria-hidden="true">
            <div ref={scheduleRefMobile} className="w-270 h-[1920px] bg-white dark:bg-[#1a1a1a] flex flex-col ijustify-center py-50 px-40">

              <div className={`${isExportingMobile ? "block" : "hidden"} bg-white dark:bg-[#1a1a1a]`}>
                <div className="">
                  <p className={`font-bold text-[2rem] text-black dark:text-white bg-white dark:bg-[#1a1a1a]`}> BSCS-2A | 1<sup>st</sup> Semester A.Y. 2026-2027</p>
                </div>

                <div className={` flex items-center bg-white dark:bg-[#1a1a1a] mb-3`}>
                  <img src={CvSULogo} alt="CvSU Logo" className="w-8 h-7"></img>
                  <p className="text-black dark:text-white font-semibold text-[1.3rem] ml-2">Cavite State University - Imus campus</p>
                </div>
              </div>

              <table className="border-collapse text-xs w-full h-full">
                <thead>
                  <tr>
                    <th className="bg-[#1B651B] text-white border border-gray-300 dark:border-[#444444] p-2 w-24">
                      TIME
                    </th>
                    {DAYS.map((d) => (
                      <th
                        key={d}
                        className="bg-[#F5F5F5] dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#2b2b2b] text-black dark:text-gray-200 uppercase w-32 p-3"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1a1a1a]">
                  {TIME_SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="border border-gray-300 dark:border-[#444444] py-3 text-center font-bold text-gray-500 dark:text-[#E0E0E0] bg-gray-50 dark:bg-[#1a1a1a] w-24 whitespace-nowrap px-2">
                        <div>{TIME_LABELS[si]}</div>
                        {TIME_LABELS[si + 1] && (
                          <div className="text-[10px] font-normal opacity-60">
                            – {TIME_LABELS[si + 1]}
                          </div>
                        )}
                      </td>
                      {DAYS.map((d) => {
                        const subject = getSubjectAt(d, slot);
                        const start = isStart(subject, slot);

                        if (subject && !start) return null;

                        if (!subject) {
                          return <td key={d} className="border border-gray-300 dark:border-[#444444] w-32" />;
                        }

                        const colorIdx = getColorIndex(subject.code);
                        const bgColor = colorIdx >= 0 ? COLORS[colorIdx % COLORS.length] : "";
                        const textColor = colorIdx >= 0 ? TEXT_COLORS[colorIdx % TEXT_COLORS.length] : "";
                        const span = getSlotSpan(subject);

                        return (
                          <td
                            key={d}
                            rowSpan={span}
                            className={`border border-gray-300 dark:border-[#444444] w-32 text-left font-bold align-top ${bgColor}`}
                          >
                            <div className={`mt-2 px-2 ${textColor}`}>
                              <p className="font-bold">{subject.code}</p>
                              <p className={`text-[10px] ${subject.room?.toUpperCase() === "ASYNC" ? "text-red-500 font-bold" : subject.room?.toUpperCase() === "TBA" ? "text-amber-400 font-semibold" : "font-normal opacity-70"}`}>{subject.room}</p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400 dark:text-[#E0E0E0] sm:hidden">
            Swipe sideways to see the full week.
          </p>
        </>
      )}

      {!loading && subjects.length > 0 && (
        <div className="animate-on-scroll flex flex-col md:flex-row justify-center items-center mt-5 gap-5 md:gap-10">
          <Button
            text={downloading ? "Downloading..." : "Download Schedule"}
            onClick={handleDownload}
            disabled={downloading}
            bgColor="bg-[#1B651B]"
            typography="text-white font-bold text-xs whitespace-nowrap"
            padding="px-5 py-2"
            dimensions="w-fit rounded-md"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
          />
          <Button
            text={downloadingMobile ? "Downloading..." : "Download as Phone Wallpaper"}
            onClick={handleDownloadMobile}
            disabled={downloadingMobile}
            bgColor="bg-[#1B651B]"
            typography="text-white font-bold text-xs whitespace-nowrap"
            padding="px-5 py-2"
            dimensions="w-fit rounded-md"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
          />
        </div>
      )}

      {!loading && subjects.length === 0 && (
        <div className="flex flex-col justify-center items-center h-96 text-gray-400 dark:text-[#E0E0E0] text-sm gap-2">
          <p>No schedule found.</p>
        </div>
      )}
    </section>
  );
}

export default ClassSched;