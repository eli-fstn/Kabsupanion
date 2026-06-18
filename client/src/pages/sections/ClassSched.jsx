import { jsPDF } from "jspdf";
import Button from "../../components/ui/Button";
import { useState } from "react";

function ClassSched() {

  const [imageSrc, setImageSrc] = useState(null); //<---- put the image src here

  async function downloadAsPDF(filename = "BSCS-2A Class Schedule") {
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
      pdf.save(filename);
    };
  }

  return(
    <section className="min-h-screen p-10" id="class-sched">
      <div className="mt-3">
        <p className="font-bold text-[1.7rem] font-[montserrat] leading-7">Class Schedule</p>
        <p className="text-[1rem]">Keep track of your classes and never miss an important session.</p>
      </div>
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl h-120 flex flex-col items-center justify-between p-4">

        {imageSrc ? (
          <img src={imageSrc} alt="Class Schedule" className="w-50 object-contain flex-1" />
        ) : (
          <div className="flex justify-center items-center flex-1">
            <p className="text-gray-400">There's no image uploaded yet.</p>
          </div>
        )}

        {imageSrc && (
          <Button onClick={() => downloadAsPDF()}>
            <span className="active:scale-95 transition-transform duration-100 bg-[#1B651B] text-white font-bold text-[1rem] px-6 py-2 mt-4 rounded-md inline-block">
              Download
            </span>
          </Button>
        )}

      </div>
    </section>
  );
}

export default ClassSched