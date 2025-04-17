export const artisanSignup = async (formData) => {
    try {
      const response = await fetch("https://maan-meal-app.onrender.com/api/artisan/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Signup failed. Please try again.");
      }
  
      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Something went wrong.");
    }
  };
  