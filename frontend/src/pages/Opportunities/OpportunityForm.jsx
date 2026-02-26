import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const OpportunityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    duration: "",
    location: ""
  });

  // Load data if editing
  useEffect(() => {
    if (id) {
      fetch(`/opportunities/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            date: data.date || "",
            duration: data.duration || "",
            location: data.location || ""
          });
        })
        .catch(err => console.error("Error loading data:", err));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        id ? `/opportunities/${id}` : "/opportunities",
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save opportunity");
      }

      navigate("/opportunities"); // redirect after save
    } catch (error) {
      console.error(error);
      alert("Error saving opportunity");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{id ? "Edit Opportunity" : "Create Opportunity"}</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "15px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "8px 15px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default OpportunityForm;