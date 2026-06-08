/**
 * API endpoint functions — all backend calls go through here.
 * Uses the shared request() client from apiClient.js.
 */
import { request } from './apiClient';

// ── Health ──
export const checkHealth = () => request("/health");

// ── Face Detection ──
export const detectFaces = (image) =>
  request("/faces/detect", { method: "POST", body: JSON.stringify({ image }) });

// ── Attendance ──
export const scanAttendance = (image, voiceBlob) => {
  const fd = new FormData();
  if (image && typeof image === "string") {
    const arr = image.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    fd.append("image", new File([u8arr], "face.jpg", {type:mime}));
  } else if (image instanceof Blob) {
    fd.append("image", image, "face.jpg");
  }

  if (voiceBlob) {
    fd.append("voice", voiceBlob, "voice.webm");
  }

  return request("/attendance/scan", {
    method: "POST",
    body: fd,
  });
};

export const submitAttendance = (entries, imageContext = "upload") =>
  request("/attendance", {
    method: "POST",
    body: JSON.stringify({ entries, image_context: imageContext }),
  });

export const getTodayAttendance = () => request("/attendance/today");

export const getAttendanceByDate = (date) =>
  request(`/attendance?date=${date}`);

export const getCorrections = () => request("/attendance/corrections");


// ── Users ──
export const registerUser = (name, image, voiceBlob) => {
  const fd = new FormData();
  fd.append("name", name);
  
  if (image && typeof image === "string") {
    const arr = image.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    fd.append("image", new File([u8arr], "face.jpg", {type:mime}));
  } else if (image instanceof Blob) {
    fd.append("image", image, "face.jpg");
  }

  if (voiceBlob) {
    fd.append("voice", voiceBlob, "voice.webm");
  }

  return request("/users/register_dynamic/", {
    method: "POST",
    body: fd,
  });
};

export const listUsers = (page = 1, pageSize = 10) => request(`/users/?page=${page}&page_size=${pageSize}`);

export const updateUser = (userId, name, image = null, voiceBlob = null) => {
  const fd = new FormData();
  if (name) fd.append("name", name);
  
  if (image && typeof image === "string") {
    const arr = image.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    fd.append("image", new File([u8arr], "face.jpg", {type:mime}));
  } else if (image instanceof Blob) {
    fd.append("image", image, "face.jpg");
  }

  if (voiceBlob) {
    fd.append("voice", voiceBlob, "voice.webm");
  }

  return request(`/users/${userId}`, {
    method: "PUT",
    body: fd,
  });
};

export const deleteUser = (userId) =>
  request(`/users/${userId}`, { method: "DELETE" });
