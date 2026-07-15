import Sidebar from "../../components/layout/Sidebar";
import { Icon } from "@iconify/react";
import { getResources, deleteResources } from "../../services/resources";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import UserIcon from "../../components/common/UserIcon";
import Modal from "../../components/ui/Modal";
import LoadingIcon from "../../components/ui/LoadingIcon";

function AdminResources() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [confirmationModal, setConfirmationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([1]);
  const [openPreview, setOpenPreview] = useState(false); 
  const [loadingForm, setLoadingForm] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleDeleteOpen = (resource) => {
    setSelectedResource(resource);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoadingForm(true);
    try {
      await deleteResources(selectedResource.id);
      setDeleteModalOpen(false);
      fetchResources();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleConfirmation = (resource) => {
    setSelectedResource(resource);
    setPages([1]);
    setConfirmationModalOpen(true);
  };

  const toPageUrl = (url, page) =>
    url
      .replace("/upload/", `/upload/f_jpg,pg_${page}/`)
      .replace(".pdf", ".jpg");

  const handlePageLoad = (page) => {
    setPages((prev) =>
      prev.includes(page + 1) ? prev : [...prev, page + 1]
    );
  };

  const handleClose = () => {
    setOpenPreview(false);
    setPages([1]);
  }

  return (
    <div className="bg-[#fafafa] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.5rem] font-[montserrat]">Resources List</p>
          <p className="text-gray-400 text-sm">Manage and monitor uploaded resources for your section.</p>
        </div>

        <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.2fr_.5fr_1fr_1fr_1fr_1fr_.6fr] gap-4 bg-[#F5F5F5] p-2 items-center text-[#888888] text-xs font-bold border-b border-gray-200">
                <td className="flex items-center">No.</td>
                <th className="flex items-center">Image</th>
                <th className="flex items-center"><Icon className="mr-2" icon="mdi:text-box-outline" width="20" height="20" />Title</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="20" height="20" />Subject</th>
                <th className="flex items-center"><UserIcon dimensions="w-5 h-5 mr-2" />Uploader</th>
                <th className="flex items-center">Status</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-110 overflow-y-auto flex flex-col">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[.2fr_.5fr_1fr_1fr_1fr_1fr_.6fr] gap-5 border-b border-gray-100 px-3 py-2 items-center"
                  >
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-4" />
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                    <div className="flex gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              resources.length > 0 ? (
                <table className="w-full">
                  <tbody>
                    {resources.map((t, i) => (
                      <tr key={t.id} className="grid grid-cols-[.2fr_.5fr_1fr_1fr_1fr_1fr_.6fr] gap-5 border-b border-gray-100 px-3 py-1 items-center text-xs font-medium transition-all duration-200 hover:bg-gray-100">
                        <td className="text-[#828282]">{i + 1}</td>
                        <td>
                          <img
                            src={toPageUrl(t.fileUrl, 1)}
                            alt={t.title}
                            loading="lazy"
                            className="w-10 h-10 rounded object-cover border border-gray-200"
                          />
                        </td>
                        <td>{t.title}</td>
                        <td>{t.subject.code}</td>
                        <td>{t.uploadedBy.name}</td>
                        <td>
                          {status === "Pending" ?
                            <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200">{status}</span>
                          :
                            <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-green-50 text-green-700 border-green-200">{status}</span>
                          }
                        </td>
                        <td className="flex gap-2">
                          <Button
                            text={<Icon icon="material-symbols:pending-actions" width="16" height="16" />}
                            onClick={() => handleConfirmation(t)}
                            bgColor="hover:bg-gray-200"
                            typography="text-gray-700 hover:text-black"
                            dimensions="rounded-md"
                            padding="p-1.5"
                            animation="transition-all duration-200 active:scale-95"
                          />
                          <Button
                            text={<Icon icon="mdi:trash-can-outline" width="16" height="16" />}
                            onClick={() => handleDeleteOpen(t)}
                            bgColor="hover:bg-red-100"
                            typography="text-red-500 hover:text-red-700"
                            dimensions="rounded-md"
                            padding="p-1.5"
                            animation="transition-all duration-200 active:scale-95"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex justify-center items-center flex-1">
                  <p className="text-gray-400">No subjects added yet.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Approval */}
        <Modal isOpen={confirmationModal} onClose={() => setConfirmationModalOpen(false)}>
          <div className="flex flex-col w-100 p-6">
            <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Resources Approval</p>
            <p className="text-gray-400 text-xs mb-5">Review and approve or reject this uploaded resource.</p>

            <label className="text-xs font-bold mb-1 mt-4">Image <span className="text-red-400">*</span></label>
            <div className="flex flex-col items-center gap-2">
              <img 
                src={selectedResource?.fileUrl.replace("/upload/", "/upload/f_jpg,pg_1,w_50,h_50,c_fill/")}
                alt={selectedResource?.title}
                className="text-xs duration-200 transition-all hover:shadow-md w-20"
                onClick={() => setOpenPreview(true)}
              />
              <span className="text-gray-400 text-xs text-center">(Click the image to show the full preview)</span>
              {openPreview &&
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={handleClose}>
                <div className="bg-white rounded-xl overflow-hidden w-[40vw] h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleClose}
                      bgColor="bg-transparent"
                      typography="text-gray-400 hover:text-gray-600"
                      padding="p-2 px-5"
                      dimensions="rounded-md"
                      animation="active:scale-95 transition-all duration-100"
                      text={<Icon icon="mdi:close" className="text-2xl" />}
                    />
                  </div>
                  <div className="w-full flex-1 overflow-y-auto flex flex-col items-center bg-gray-100 p-4 gap-4">
                    {selectedResource?.fileUrl && pages.map((page) => (
                      <img
                        key={page}
                        src={toPageUrl(selectedResource.fileUrl, page)}
                        alt={`Page ${page}`}
                        className="w-full rounded shadow"
                        onLoad={() => handlePageLoad(page)}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              }
            </div>

            <label className="text-xs font-bold mb-1 mt-4">Title <span className="text-red-400">*</span></label>
            <p className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">{selectedResource?.title}</p>

            <label className="text-xs font-bold mb-1 mt-4">Subject <span className="text-red-400">*</span></label>
            <p className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">{selectedResource?.subject?.code}</p>

            <label className="text-xs font-bold mb-1 mt-4">Uploader <span className="text-red-400">*</span></label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              <UserIcon dimensions="w-4 h-4" typography="text-gray-800" />
              <p className="text-xs font-semibold text-gray-800">{selectedResource?.uploadedBy?.name}</p>
            </div>

            <label className="text-xs font-bold mb-1 mt-4">Status <span className="text-red-400">*</span></label>
            <p className="px-3 py-1 text-xs w-fit font-semibold rounded-full border bg-orange-100 text-orange-700 border-orange-300">{status}</p>

            <div className="flex justify-center items-center gap-3 mt-7">
              <Button
                type="button"
                onClick={() => setConfirmationModalOpen(false)}
                text="Cancel"
                bgColor="bg-gray-100 hover:bg-gray-200"
                typography="text-gray-600 font-bold text-xs"
                padding="px-4 py-2"
                dimensions="w-fit rounded-md"
              />
              <Button
                type="button"
                onClick={() => {
                  setConfirmationModalOpen(false);
                }}
                text="Approve"
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold text-xs"
                padding="px-4 py-2"
                dimensions="w-fit rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-6">
            {loadingForm ? (
               <div className="flex flex-col justify-center items-center h-50">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5">Deleting...</p>
              </div>
            ) : (
              <>
                <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
                  <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
                </div>
                <p className="font-bold text-[1rem] text-center text-[#A32D2D]">Delete resources?</p>
                <p className="text-gray-400 text-sm text-center mt-2 mb-6"> Are you sure you want to delete <span className="font-bold text-[#3a3a3a]">{selectedResource?.title}?</span> This action cannot be undone.
                </p>
                <div className="flex justify-center items-center gap-3 w-full">
                  <Button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    text="Cancel"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={handleDeleteConfirm}
                    text="Delete"
                    bgColor="bg-[#A32D2D] hover:bg-red-800"
                    typography="text-white font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                    animation="active:scale-95 transition-all duration-100"
                  />
                </div>
              </>
              )
            }
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminResources;