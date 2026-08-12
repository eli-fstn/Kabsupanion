import Sidebar from "../../components/layout/Sidebar";
import { getUsers, editUserRole, resetPassword, deleteUser } from "../../services/adminUser.ts";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getErrorMessage } from "../../services/errorHandler.ts";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/toastContext";
import { useUser } from "../../context/userContext";
import Modal from "../../components/ui/Modal";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";
import CountUp from "react-countup";
import Pagination from "../../components/ui/Pagination.jsx";
import { isDeveloper } from "../../utils/developers.ts";

function AdminUsers() {
  const [list, setList] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [activeRole, setActiveRole] = useState("All");
  const { showToast } = useToast();
  const { student } = useUser();
  const currentUserId = student?.user?.id;

  // Role change
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [roleError, setRoleError] = useState("");

  // Reset password
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetError, setResetError] = useState("");
  const [copied, setCopied] = useState(false);

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(getErrorMessage(err));
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const isRowDeveloper = (id) => isDeveloper(id);
  const isCurrentUserDeveloper = isDeveloper(currentUserId);

  const roleFilters = ["All", "student", "admin"];

  const filteredUsers = (activeRole === "All" ? list : list.filter((u) => u.role === activeRole)).sort((a, b) => {
    const surnameA = a.name?.split(" ").at(-1) ?? "";
    const surnameB = b.name?.split(" ").at(-1) ?? "";
    return surnameA.localeCompare(surnameB);
  });

  const handleRoleFilterChange = (role) => {
    setActiveRole(role);
    setListPage(1);
  };

  // Role change modal
  const handleRoleOpen = (u) => {
    setSelected(u);
    setNewRole(u.role);
    setRoleError("");
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    if (selected.id === currentUserId && newRole !== selected.role) {
      setRoleError("You cannot change your own role.");
      return;
    }

    setLoadingForm(true);
    try {
      await editUserRole(selected.id, newRole);
      setRoleModalOpen(false);
      fetchList();
    } catch (err) {
      const message = getErrorMessage(err);
      setRoleError(message);
      showToast(message);
    } finally {
      setLoadingForm(false);
    }
  };

  // Reset password modal
  const handleResetOpen = (u) => {
    setSelected(u);
    setResetResult(null);
    setResetError("");
    setCopied(false);
    setResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    if (!selected) return;
    setLoadingForm(true);
    try {
      const data = await resetPassword(selected.id);
      setResetResult(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setResetError(message);
      showToast(message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleCopyLink = async () => {
    if (!resetResult?.resetUrl) return;
    try {
      await navigator.clipboard.writeText(resetResult.resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log(err);
    }
  };

  // Delete modal
  const handleDeleteOpen = (u) => {
    setSelected(u);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    setLoadingForm(true);
    try {
      await deleteUser(selected.id);
      setDeleteModalOpen(false);
      fetchList();
    } catch (err) {
      showToast(getErrorMessage(err));
      console.log(err);
    } finally {
      setLoadingForm(false);
    }
  };

  const usersPerPage = 10;
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (listPage - 1) * usersPerPage,
    listPage * usersPerPage
  );

  return (
    <div className="bg-[#fafafa] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 px-8 py-4">
        <div className="mb-4">
          <p className="font-bold text-[1.5rem] font-[montserrat]">Users</p>
          <p className="text-gray-400 text-sm">Manage registered user accounts and roles.</p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="my-3 flex flex-row justify-between items-center">
          <div>
            {roleFilters.map((role) => (
              <Button
                key={role}
                text={role}
                onClick={() => handleRoleFilterChange(role)}
                bgColor={activeRole === role ? "bg-[#1B651B]" : "bg-white"}
                typography={activeRole === role ? "text-xs font-bold text-white uppercase" : "text-xs font-bold text-gray-700 uppercase"}
                dimensions="rounded-2xl"
                padding="px-5 py-1"
                shadow={activeRole === role ? "border border-[#1B651B] dark:border-[#1B651B]" : "border border-gray-300 dark:border-[#5a5a5a]"}
                margin="mr-2"
                animation={activeRole === role ? "" : "transition duration-200 hover:border-gray-500 dark:hover:border-[#8a8a8a]"}
              />
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-[#888888]">Total Users: <span className="text-[#003A02] font-bold text-[1.3rem] ml-1"><CountUp.default start={0} end={filteredUsers.length} duration={1}/></span></p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white w-full mt-4 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.2fr_2fr_2fr_2fr_1fr] gap-4 bg-[#F5F5F5] p-2 items-center text-[#888888] text-xs font-bold border-b border-gray-200">
                <th className="flex items-center">No.</th>
                <th className="flex items-center"><Icon className="mr-2" icon="akar-icons:person" width="20" height="20" />Name</th>
                <th className="flex items-center"><Icon className="mr-2" icon="ic:baseline-email" width="20" height="20" />Email</th>
                <th className="flex items-center"><Icon className="mr-2" icon="fluent:status-16-regular" width="20" height="20" />Role</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-95 overflow-y-auto flex flex-col">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[.2fr_2fr_2fr_2fr_1fr] gap-5 border-b border-gray-100 px-3 py-2 items-center"
                  >
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                    <div className="flex gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              paginatedUsers.length > 0 ? (
                <table className="w-full">
                  <tbody>
                    {paginatedUsers.map((u, i) => (
                      <tr key={u.id} className="grid grid-cols-[.2fr_2fr_2fr_2fr_1fr] gap-5 border-b border-gray-100 px-3 py-1 items-center text-xs font-medium transition-all duration-200 hover:bg-gray-100">
                        <td className="text-[#828282]">{(listPage - 1) * usersPerPage + i + 1}</td>
                        <td className="truncate">
                          {u.name?.split(" ").at(-1)}, {u.name?.split(" ").slice(0, -1).join(" ")}
                          {u.id === currentUserId && <span className="text-gray-400 font-normal"> (you)</span>}
                        </td>
                        <td className="truncate">{u.email}</td>
                        <td>
                          <span
                            className={`px-3 py-0.5 text-xs font-semibold rounded-full border uppercase ${
                              isRowDeveloper(u?.id)
                                ? "bg-purple-50 text-purple-800 border-purple-500"
                                : u.role === "admin"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {isRowDeveloper(u?.id) ? "DEVELOPER" : u.role}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          {isCurrentUserDeveloper && (
                            <Button
                              text={<Icon icon="mdi:account-switch-outline" width="16" height="16" />}
                              onClick={() => handleRoleOpen(u)}
                              bgColor="hover:bg-gray-200"
                              typography="text-gray-700 hover:text-gray-500"
                              dimensions="rounded-md"
                              padding="p-1.5"
                              animation="transition-all duration-200 active:scale-95"
                            />
                          )}
                          <Button
                            text={<Icon icon="mdi:key-outline" width="16" height="16" />}
                            onClick={() => handleResetOpen(u)}
                            bgColor="hover:bg-amber-100"
                            typography="text-amber-600 hover:text-amber-700"
                            dimensions="rounded-md"
                            padding="p-1.5"
                            animation="transition-all duration-200 active:scale-95"
                          />
                          <Button
                            text={<Icon icon="mdi:trash-can-outline" width="16" height="16" />}
                            onClick={() => handleDeleteOpen(u)}
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
                  <p className="text-gray-400">No users found.</p>
                </div>
              )
            )}
          </div>
          <div className="my-5">
            <Pagination
              currentPage={listPage}
              totalPages={totalUserPages}
              onPageChange={setListPage}
            />
          </div>
        </div>

        {/* Change Role Modal */}
        <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
          <form onSubmit={handleRoleSubmit} className="flex flex-col w-80 p-6">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Saving Changes...</p>
              </div>
            ) : isRowDeveloper(selected?.id) ? (
                <div className="flex flex-col justify-center items-center h-60">
                  <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20 mb-3" />
                  <p className="font-bold text-[1.2rem] text-[#A32D2D] text-center">Action Not Allowed</p>
                  <p className="text-sm text-gray-400 text-center my-5">
                    <span className="font-bold text-[#3a3a3a]">
                      {selected?.name}
                    </span>{" "}
                    is a protected developer account. The user's role cannot be changed.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setRoleModalOpen(false)}
                    text="Cancel"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                  />
                </div>
            ) : (
              <>
                <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Change Role</p>
                <p className="text-gray-400 text-xs mb-5">Update the role for <span className="font-bold text-[#3a3a3a]">{selected?.name}</span>.</p>

                <label className="text-xs font-bold mb-1">Role <span className="text-red-400">*</span></label>
                <select
                  value={newRole}
                  onChange={(e) => { setNewRole(e.target.value); setRoleError(""); }}
                  className="border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white border-gray-300"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>

                {selected?.id === currentUserId && (
                  <p className="text-amber-600 text-xs mt-2">You're editing your own account, role changes to yourself aren't allowed.</p>
                )}

                {roleError && <p className="text-red-500 text-xs font-bold text-center my-1">{roleError}</p>}

                <div className="flex flex-row justify-end gap-3 mt-5">
                  <Button
                    type="button"
                    onClick={() => setRoleModalOpen(false)}
                    text="Cancel"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                  />
                  <Button
                    type="submit"
                    text="Save Changes"
                    bgColor="bg-[#1B651B]"
                    typography="text-white font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                    animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
                  />
                </div>
              </>
            )}
          </form>
        </Modal>

        {/* Reset Password Modal */}
        <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)}>
          <div className="flex flex-col w-80 p-6">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Generating link...</p>
              </div>
            ) : isRowDeveloper(selected?.id) && selected?.id !== currentUserId ? (
              <div className="flex flex-col justify-center items-center h-60">
                <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20 mb-3" />
                <p className="font-bold text-[1.2rem] text-[#A32D2D] text-center">Action Not Allowed</p>
                <p className="text-sm text-gray-400 text-center my-5">
                  <span className="font-bold text-[#3a3a3a]">
                    {selected?.name}
                  </span>{" "}
                  is a protected developer account. A password reset link cannot be generated.
                </p>
                <Button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  text="Cancel"
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  typography="text-gray-600 font-bold text-xs"
                  padding="px-4 py-2"
                  dimensions="w-fit rounded-md"
                />
              </div>
            ) : resetResult ? (
              <>
                <div className="bg-[#eaf3de] rounded-full p-4 mb-4 mx-auto w-fit">
                  <Icon icon="mdi:key-outline" width="30" className="text-[#1B651B]" />
                </div>
                <p className="font-bold text-[1rem] text-[#1B651B] text-center">Reset Link Generated</p>
                <p className="text-gray-400 text-xs text-center mt-2 mb-4">This link isn't emailed automatically, copy it and send it to <span className="font-bold text-[#3a3a3a]">{selected?.name}</span> yourself.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-xs break-all text-gray-700 mb-2">
                  {resetResult.resetUrl}
                </div>
                <p className="text-gray-400 text-[.65rem] mb-4">Expires: {new Date(resetResult.expiresAt).toLocaleString()}</p>
                <div className="flex flex-row justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    text="Close"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    text={copied ? "Copied!" : "Copy Link"}
                    bgColor="bg-[#1B651B]"
                    typography="text-white font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                    animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat'] mb-1">Reset Password</p>
                <p className="text-gray-400 text-xs mb-4">Generate a one-time password reset link for <span className="font-bold text-[#3a3a3a]">{selected?.name}</span>. You'll need to send it to them yourself.</p>

                {resetError && <p className="text-red-500 text-xs font-bold text-center my-1">{resetError}</p>}

                <div className="flex flex-row justify-end gap-3 mt-5">
                  <Button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    text="Cancel"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={handleResetConfirm}
                    text="Generate Link"
                    bgColor="bg-[#1B651B]"
                    typography="text-white font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-fit rounded-md"
                    animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
                  />
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-6">
            {selected?.id === currentUserId ? (
              <div className="flex flex-col justify-center items-center h-50">
                <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20" />
                <p className="text-sm text-gray-400 text-center my-5">You can not delete your own account.</p>
                <Button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  text="Cancel"
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  typography="text-gray-600 font-bold text-xs"
                  padding="px-4 py-2"
                  dimensions="w-fit rounded-md"
                />
              </div>
            ) : loadingForm ? (
              <div className="flex flex-col justify-center items-center h-50">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Deleting...</p>
              </div>
            ) : isRowDeveloper(selected?.id) ? (
              <div className="flex flex-col justify-center items-center h-60">
                <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20 mb-3" />
                <p className="font-bold text-[1.2rem] text-[#A32D2D] text-center">Action Not Allowed</p>
                <p className="text-sm text-gray-400 text-center my-5">
                  <span className="font-bold text-[#3a3a3a]">
                    {selected?.name}
                  </span>{" "}
                  is a protected developer account. The account cannot be deleted.
                </p>
                <Button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  text="Cancel"
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  typography="text-gray-600 font-bold text-xs"
                  padding="px-4 py-2"
                  dimensions="w-fit rounded-md"
                />
              </div>
            ) : (
              <>
                <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
                  <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
                </div>
                <p className="font-bold text-[1rem] text-[#A32D2D] text-center">Delete User?</p>
                <p className="text-gray-400 text-sm text-center mt-2 mb-6">Are you sure you want to delete <span className="font-bold text-[#3a3a3a]">{selected?.name}</span>? This action cannot be undone.</p>
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
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminUsers;