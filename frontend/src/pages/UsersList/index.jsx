/**
 * UsersList Page — User registration, management, and history.
 * Composes: useCamera, useToast hooks + CameraPreview, CameraControls,
 * RegistrationForm, UserCard, HistoryModal, ToastContainer components.
 */
import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, Upload, Shield } from "lucide-react";
import { useToast } from "../../hooks";
import {
  listUsers,
  deleteUser,
  registerUser,
  detectFaces,
  updateUser,
} from "../../services/api";
import { ToastContainer, Pagination, VoiceRecorder, BiometricCapture } from "../../components/common";
import { RegistrationForm } from "../../components/users";
import { UserCard } from "../../components/users";

export default function UsersList() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Registration state
  const [regName, setRegName] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [rawVoice, setRawVoice] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);

  // Edit state
  const [editUser, setEditUser] = useState(null);



  const fetchUsers = useCallback(
    async (page = currentPage, size = pageSize) => {
      setLoading(true);
      try {
        const res = await listUsers(page, size);
        setUsers(res.data || []);
        setTotalPages(res.total_pages || 1);
        setCurrentPage(res.page || 1);
      } catch (e) {
        toast.setError(e.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize, fetchUsers]);

  // ── Delete ──
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await deleteUser(id);
      toast.setMsg(`Deleted "${name}"`);
      fetchUsers();
    } catch (e) {
      toast.setError(e.message);
    }
  };

  // ── Edit ──
  const handleEditClick = (u) => {
    setEditUser(u);
    setRegName(u.name);
    setRawImage(null);
    setPreviewImg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditUser(null);
    setRegName("");
    setRawImage(null);
    setPreviewImg(null);
  };



  // ── Detect embedding from image ──
  const detectEmbedding = async (imageData) => {
    setRegLoading(true);
    toast.clearToast();
    setRawImage(null);
    try {
      const res = await detectFaces(imageData);
      const data = res.data || {};
      const faces = data.faces || [];
      if (faces.length === 0) {
        toast.setError("No face detected. Please try another image.");
        return;
      }
      if (faces.length > 1) {
        toast.setError(
          "Multiple faces detected. Please use an image with a single face.",
        );
        return;
      }
      const face = faces[0];
      setPreviewImg(imageData);
      setDetectedFaces(faces);

      if (!face.is_new_face && face.name) {
        setRawImage(null);
        setRegName("");
        toast.setError(
          `This face is already registered as "${face.name}". You cannot register the same face again.`,
        );
      } else {
        setRawImage(imageData);
        setRegName("");
        toast.setMsg("Unknown face detected! Enter a name to register.");
      }
    } catch (e) {
      toast.setError(e.message);
    } finally {
      setRegLoading(false);
    }
  };


  // ── Register ──
  const handleRegister = async () => {
    if (!editUser && !regName.trim()) return;
    if (editUser && !regName.trim() && !rawImage && !rawVoice) {
      toast.setError("Please provide at least one field to update.");
      return;
    }

    if (!editUser && !rawImage) {
      toast.setError("Face image is required.");
      return;
    }
    if (!editUser && !rawVoice) {
      toast.setError("Voice recording (min 45s) is required.");
      return;
    }

    setRegLoading(true);
    toast.clearToast();
    try {
      if (editUser) {
        const res = await updateUser(editUser.id, regName.trim(), rawImage, rawVoice);
        toast.setMsg(res.message || "Updated successfully!");
        setEditUser(null);
      } else {
        const res = await registerUser(regName.trim(), rawImage, rawVoice);
        toast.setMsg(res.message || "Registered successfully!");
      }
      setRegName("");
      setRawImage(null);
      setRawVoice(null);
      setPreviewImg(null);
      setDetectedFaces([]);
      fetchUsers();
    } catch (e) {
      toast.setError(e.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 fade-in items-start">
      {/* Left Column: Registration */}
      <div className="lg:col-span-1 space-y-6 sticky top-24">
        <RegistrationForm
          regName={regName}
          setRegName={setRegName}
          regLoading={regLoading}
          rawImage={rawImage}
          previewImg={previewImg}
          detectedFaces={detectedFaces}
          editUser={editUser}
          rawVoice={rawVoice}
          onRegister={handleRegister}
          onCancelEdit={handleCancelEdit}
          users={users}
        />

        <VoiceRecorder onAudioReady={setRawVoice} disabled={regLoading} isOptional={!!editUser} />

        {/* Camera controls for registration */}
        <div className="glass-card p-4">
          <BiometricCapture
            mode="face"
            loading={regLoading}
            onCapture={({ image }) => detectEmbedding(image)}
            toast={toast}
          />
        </div>
      </div>

      {/* Right Column: Users List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Toasts */}
        <ToastContainer
          error={toast.error}
          msg={toast.msg}
          onClearError={() => toast.setError("")}
          onClearMsg={() => toast.setMsg("")}
        />

        <div className="glass-card p-6 min-h-[600px]">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Registered Users
            <span className="badge badge-secondary badge-sm">
              {users.length}
            </span>
          </h2>
          <p className="text-xs opacity-50 mb-5">
            Manage registered face templates
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users registered yet.</p>
              <p className="text-xs mt-1">
                Upload a face image above to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {users.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1); // Reset to first page on size change
                }}
              />
            </>
          )}
        </div>
      </div>


    </div>
  );
}
