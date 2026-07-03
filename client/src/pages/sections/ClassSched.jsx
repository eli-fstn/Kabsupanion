import { useState, useEffect, useRef } from "react";
import { getSubjects } from "../../services/subjects";
import { toPng } from "html-to-image";
import Button from "../../components/ui/Button";

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
  "bg-cyan-100", "bg-yellow-100", "bg-green-100", "bg-orange-100",
  "bg-pink-100", "bg-purple-100", "bg-red-100", "bg-blue-100",
];

const TEXT_COLORS = [
  "text-cyan-800", "text-yellow-800", "text-green-800", "text-orange-800",
  "text-pink-800", "text-purple-800", "text-red-800", "text-blue-800",
];

function ClassSched() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const scheduleRef = useRef(null);

  const handleDownload = async () => {
    if (!scheduleRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(scheduleRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "BSCS-2A-Class-Schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
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

  return (
    <section className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10" id="class-sched">
      <header className="mt-3 mb-6">
        <p className="font-bold text-[1.5rem] md:text-[1.7rem] font-[montserrat] leading-7">
          Class Schedule
        </p>
        <p className="text-sm sm:text-base text-gray-500">
          Keep track of your classes and never miss an important session.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-60 text-gray-400 text-sm">
          Loading schedule...
        </div>
      ) : (
        <>
          {/* Horizontally scrollable schedule — table keeps its natural width and scrolls under this wrapper on narrow screens */}
          <div
            className="overflow-x-auto rounded-md border border-gray-200 [-webkit-overflow-scrolling:touch]"
          >
            <div ref={scheduleRef} className="min-w-[850px]">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="bg-[#1B651B] text-white border border-gray-300 p-2 text-xs w-24">
                      TIME
                    </th>
                    {DAYS.map((d) => (
                      <th
                        key={d}
                        className="bg-[#F5F5F5] border border-gray-200 text-black text-xs uppercase w-32 p-3"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {TIME_SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="border border-gray-300 py-3 text-center text-xs font-bold text-gray-500 bg-gray-50 w-24 whitespace-nowrap px-2">
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
                        const colorIdx = subject ? getColorIndex(subject.code) : -1;
                        const bgColor = colorIdx >= 0 ? COLORS[colorIdx % COLORS.length] : "";
                        const textColor =
                          colorIdx >= 0 ? TEXT_COLORS[colorIdx % TEXT_COLORS.length] : "";

                        return (
                          <td
                            key={d}
                            className={`border border-gray-300 w-32 text-center text-xs font-bold ${bgColor}`}
                          >
                            {subject && start ? (
                              <div className={`px-2 py-3 ${textColor}`}>
                                <p className="font-bold">{subject.code}</p>
                                <p className="font-normal opacity-70 text-[10px]">
                                  {subject.room}
                                </p>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400 sm:hidden">
            Swipe sideways to see the full week.
          </p>
        </>
      )}

      {!loading && subjects.length > 0 && (
        <div className="flex justify-center items-center mt-5">
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
        </div>
      )}

      {!loading && subjects.length === 0 && (
        <div className="flex flex-col justify-center items-center h-60 text-gray-400 text-sm gap-2">
          <p>No schedule found.</p>
        </div>
      )}
    </section>
  );
}

export default ClassSched;