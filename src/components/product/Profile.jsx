// src/components/profile/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = ({ user }) => {
  const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const PROFILE_TABLE = "Profile";
  const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${PROFILE_TABLE}`;

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    address: "",
    profile_image_url: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch profile from Airtable
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const filter = encodeURIComponent(`{user_id}='${user.id}'`);
      const res = await axios.get(`${AIRTABLE_URL}?filterByFormula=${filter}`, { headers });
      if (res.data.records.length > 0) {
        const record = res.data.records[0];
        setProfile(record);
        setForm({
          name: record.fields.name || "",
          age: record.fields.age || "",
          address: record.fields.address || "",
          profile_image_url: record.fields.profile_image?.[0]?.url || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getAttachmentObject = (url) => {
    if (!url) return [];
    return [{ url }];
  };

  const handleSubmit = async () => {
    if (!user?.id) return alert("User not logged in");
    setLoading(true);

    const payload = {
      records: [
        {
          id: profile?.id,
          fields: {
            user_id: user.id,
            name: form.name,
            age: Number(form.age),
            email: user.email, // Automatically set from user
            address: form.address,
            profile_image: getAttachmentObject(form.profile_image_url),
          },
        },
      ],
    };

    try {
      const res = profile
        ? await axios.patch(`${AIRTABLE_URL}`, payload, { headers })
        : await axios.post(`${AIRTABLE_URL}`, payload, { headers });

      alert("Profile saved!");
      fetchProfile();
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Please login to view your profile.</p>;

  return (
    <div className="profile-container" style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2>My Profile</h2>

      <div>
        {form.profile_image_url && (
          <img
            src={form.profile_image_url}
            alt="Profile"
            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
          />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        <input type="text" placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        <input type="number" placeholder="Age" name="age" value={form.age} onChange={handleChange} />
        <input type="text" placeholder="Address" name="address" value={form.address} onChange={handleChange} />
        <input
          type="text"
          placeholder="Profile Image URL"
          name="profile_image_url"
          value={form.profile_image_url}
          onChange={handleChange}
        />
        <p><strong>Email:</strong> {user.email}</p>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : profile ? "Update Profile" : "Add Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
