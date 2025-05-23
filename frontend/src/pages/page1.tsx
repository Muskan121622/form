
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { getUserIdFromToken } from '../utils/auth';

const Page1 = ({ formId, setFormId }: { formId: string | null; setFormId: (id: string) => void }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [zipcodeError, setZipcodeError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: ''
  });

  const [educationData, setEducationData] = useState({ qualification: '', institution: '' });
  const [projects, setProjects] = useState([{ name: '', description: '' }]);

  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);
useEffect(() => {
  const savedData = localStorage.getItem('formData');
  if (savedData) {
    setFormData(JSON.parse(savedData));
  }
}, []);

useEffect(() => {
  if (currentPage === 1) {
    localStorage.setItem('formData', JSON.stringify(formData));
  }
}, [currentPage, formData]);
useEffect(() => {
  const id = getUserIdFromToken();
  setUserId(id);

  if (id && !formId) {
    axios.get(`https://form-3-tlgr.onrender.com/api/form/by-user/${id}`)
      .then(res => {
        if (res.data && res.data.id) {
          setFormId(res.data.id);
        }
      })
      .catch(err => {
        console.error("Failed to load form ID for user:", err);
      });
  }
}, []);



type Project = {
  name: string;
  description: string;
};

const [isEmailLocked, setIsEmailLocked] = useState(false);

useEffect(() => {
  if (formId) {
    axios.get(`https://form-3-tlgr.onrender.com/api/form/${formId}`)
      .then(res => {
        const data = res.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          address1: data.address1 || '',
          address2: data.address2 || '',
          city: data.city || '',
          state: data.state || '',
          zipcode: data.zipcode || '',
        });
        if (data.email) {
  setIsEmailLocked(true); // ✅ Lock the email input
}
        setEducationData({
          qualification: data.isStudying ? 'Yes' : 'No',
          institution: data.institution || '',
        });
        if (Array.isArray(data.projects)) {
          setProjects(data.projects.map((p: Project) => ({
  name: p.name,
  description: p.description
})));

        }
      })
      .catch(err => console.error(err));
  }
}, [formId]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'zipcode') {
      if (!/^\d*$/.test(value)) {
        setZipcodeError('Zipcode must be a number.');
      } else if (value.length > 0 && value.length < 6) {
        setZipcodeError('Zipcode must be exactly 6 digits.');
      } else {
        setZipcodeError('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePage1 = async (): Promise<boolean> => {
    if (!userId) {
      alert("User is not logged in or token is invalid.");
      return false;
    }

    

    const { name, email, address1, city, state, zipcode } = formData;
    if (!name || !email || !address1 || !city || !state || !zipcode) {
      alert("Please fill in all required fields.");
      return false;
    }

    if (!/^\d{6}$/.test(zipcode)) {
      alert("Zipcode must be a 6-digit number.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    try {  if (formId) {
      return true;
    }
      const res = await axios.post('https://form-3-tlgr.onrender.com/api/form/page1', {
        ...formData,
        userId,
        // id: formId
      });

        if (res.data.message === "Email already exists") {
      alert("This email has already been used.");
      return false;
    }
       if (res.data.id) {
      setFormId(res.data.id);
      setIsEmailLocked(true); // ✅ lock email after successful save
    }

    return true;
    } catch (err) {
        if (axios.isAxiosError(err)) {
    const message = err.response?.data?.error || err.response?.data?.message;
    if (message === "This email has already been used to submit the form.") {
      alert("This email has already been used.");
      return false;
    }
  }
      console.error(err);
      alert('Failed to save Page 1');
      return false;
    }
  };

  const handleSavePage2 = async (): Promise<boolean> => {
   
    if (!educationData.qualification) {
    alert("Please select your education status.");
    return false;
  }
  if (educationData.qualification === 'yes' && !educationData.institution.trim()) {
    alert("Please provide your institution name.");
    return false;
  }
   
   
   
    try {
      await axios.post('https://form-3-tlgr.onrender.com/api/form/page2', {
        id: formId,
        ...educationData
      });
      return true;
    } catch (err) {
      console.error(err);
      alert('Failed to save Education Info');
      return false;
    }
  };


const [isSubmitted, setIsSubmitted] = useState(false);

const handleSavePage3 = async (): Promise<boolean> => {
  if (!formId || projects.length === 0) {
    alert('Missing form ID or projects');
    return false;
  }
for (const p of projects) {
    if (!p.name.trim() || !p.description.trim()) {
      alert("Please complete all project fields.");
      return false;
    }
  }
  try {
    await axios.post('https://form-3-tlgr.onrender.com/api/form/page3', {
      userFormId: formId,
      projects,
    });

    setIsSubmitted(true); // ✅ show confirmation screen
    return true;
  } catch (err) {
    console.error(err);
    alert('Failed to save Projects Info');
    return false;
  }
};



//   const handleNavigation = async (page: number) => {
//     let success = true;

//     if (currentPage === 1) success = await handleSavePage1();
//     else if (currentPage === 2) success = await handleSavePage2();
//     else if (currentPage === 3) success = await handleSavePage3();
//     success = await handleSavePage3();

//     if (success && page > 3) {
//       alert("Your response has been submitted successfully.");
//       return;
//     }
//   }
//     if (success) {
//       setCurrentPage(page);
//     }
//   };
const handleNavigation = async (nextPage: number): Promise<void> => {
  let success = false;

  if (currentPage === 1) {
    success = await handleSavePage1();
  } else if (currentPage === 2) {
    success = await handleSavePage2();
  } else if (currentPage === 3) {
  if (nextPage > currentPage) {
    success = await handleSavePage3();
    if (success && nextPage > 3) {
      return;
    }
  } else {
    success = true; // allow back navigation without validation
  }
}

  

  if (success) {
    setCurrentPage(nextPage);
  }
};

  const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200  bg-gray-50 placeholder-gray-500";

  const renderPage = () => {
    if (currentPage === 1) {
      return (
        <div className="space-y-4">
        

          <input name="name" type="name" value={formData.name} onChange={handleChange} required placeholder="Name" className={inputStyles} />
          <input
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  required
  placeholder="Email"
  className={inputStyles}
  readOnly={isEmailLocked}
/>
          <input name="address1" value={formData.address1} onChange={handleChange} required placeholder="Address Line 1" className={inputStyles} />
          <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className={inputStyles} />
          <input name="city" value={formData.city} onChange={handleChange} required placeholder="City" className={inputStyles} />

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`${inputStyles}  max-h-40 overflow-y-hidden`}
             
              required
            >
              <option value="">Select State</option>
              {[
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
                "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
                "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
                "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
              ].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <input name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" className={inputStyles} />
            {zipcodeError && <p className="text-red-600 text-sm mt-1">{zipcodeError}</p>}
          </div>
        </div>
      );
    } else if (currentPage === 2) {
  return (
    <div className="space-y-4">
      {/* Are you still studying? */}
      <div>
        <p className="text-gray-700 font-medium">Are you still studying?</p>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="studying"
              value="yes"
              checked={educationData.qualification === 'yes'}
              onChange={() => setEducationData({ ...educationData, qualification: 'yes' })}
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="studying"
              value="no"
              checked={educationData.qualification === 'no'}
              onChange={() => setEducationData({ ...educationData, qualification: 'no', institution: '' })}
            />
            No
          </label>
        </div>
      </div>

      {/* Conditionally show input if still studying */}
      {educationData.qualification === 'yes' && (
        <input
          value={educationData.institution}
          onChange={(e) => setEducationData({ ...educationData, institution: e.target.value })}
          placeholder="Where are you studying?"
          className={inputStyles}
        />
      )}
    </div>
      );
    } else {
  return (
    <div className="space-y-6">
      {projects.map((p, idx) => (
        <div key={idx} className="space-y-2 border rounded-md p-4 shadow-sm relative bg-white">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700">Project {idx + 1}</h4>
            {projects.length > 1 && (
              <button
                onClick={() => {
                  const updated = projects.filter((_, i) => i !== idx);
                  setProjects(updated);
                }}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <input
            value={p.name}
            onChange={(e) => {
              const newProjects = [...projects];
              newProjects[idx].name = e.target.value;
              setProjects(newProjects);
            }}
            placeholder="Project Name"
            className={inputStyles}
          />

          <textarea
            value={p.description}
            onChange={(e) => {
              const newProjects = [...projects];
              newProjects[idx].description = e.target.value;
              setProjects(newProjects);
            }}
            placeholder="Project Description"
            className={inputStyles}
            rows={4}
          />
        </div>
      ))}

      <button
        onClick={() => setProjects([...projects, { name: '', description: '' }])}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
      >
        + Add Project
      </button>
    </div>
      );
    }
  };


return ( <div className="min-h-screen  items-center  bg-gradient-to-r from-black to-blue-900">
  <div className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-white shadow-2xl rounded-3xl space-y-6 animate-fade-in">
    {isSubmitted ? (
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-green-600">Your response has been submitted successfully 🎉</h2>
        <p className="text-gray-700">Thank you for filling out the form.</p>
      </div>
    ) : (
      <>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {currentPage === 1 ? 'Personal Info' : currentPage === 2 ? 'Education' : 'Projects'}
        </h2>

        {renderPage()}

        {/* Pagination + Buttons here */}
        <div className="flex flex-col items-center gap-4">
          {/* Pagination */}
          <div className="flex items-center gap-2 text-gray-700 text-lg">
            <button onClick={() => handleNavigation(Math.max(currentPage - 1, 1))} className="hover:text-blue-600">&lt;</button>
            {[1, 2, 3].map(num => (
              <button
                key={num}
                onClick={() => handleNavigation(num)}
                className={currentPage === num ? 'font-bold text-blue-600' : 'hover:text-blue-600'}
              >
                {num}
              </button>
            ))}
            <button onClick={() => handleNavigation(Math.min(currentPage + 1, 3))} className="hover:text-blue-600">&gt;</button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between w-full">
            <button
              onClick={() => handleNavigation(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={() => handleNavigation(currentPage === 3 ? 4 : currentPage + 1)}
   disabled={currentPage === 3 && projects.length === 0}
   className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
>
   {currentPage === 3 ? 'Submit' : 'Save & Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </>
    )}
  </div></div>
);

};

export default Page1;   

















// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ArrowRight, ArrowLeft } from 'lucide-react';
// import { getUserIdFromToken } from '../utils/auth';

// type Project = { name: string; description: string };

// const Page1 = ({ formId, setFormId }: { formId: string | null; setFormId: (id: string) => void }) => {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [zipcodeError, setZipcodeError] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isEmailLocked, setIsEmailLocked] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     address1: '',
//     address2: '',
//     city: '',
//     state: '',
//     zipcode: ''
//   });

//   const [educationData, setEducationData] = useState({ qualification: '', institution: '' });
//   const [projects, setProjects] = useState<Project[]>([{ name: '', description: '' }]);

//   // Fetch userId and formId
//   useEffect(() => {
//     const id = getUserIdFromToken();
//     setUserId(id);

//     if (id && !formId) {
//       axios.get(`http://localhost:3001/api/form/by-user/${id}`)
//         .then(res => {
//           if (res.data?.id) {
//             setFormId(res.data.id);
//           }
//         })
//         .catch(err => console.error("Failed to load form ID for user:", err));
//     }
//   }, []);

//   // Load form data from local storage
//   useEffect(() => {
//     const savedData = localStorage.getItem('formData');
//     if (savedData) {
//       setFormData(JSON.parse(savedData));
//     }
//   }, []);

//   useEffect(() => {
//     if (currentPage === 1) {
//       localStorage.setItem('formData', JSON.stringify(formData));
//     }
//   }, [currentPage, formData]);

//   // Load form data from DB if formId exists
//   useEffect(() => {
//     if (formId) {
//       axios.get(`http://localhost:3001/api/form/${formId}`)
//         .then(res => {
//           const data = res.data;
//           setFormData({
//             name: data.name || '',
//             email: data.email || '',
//             address1: data.address1 || '',
//             address2: data.address2 || '',
//             city: data.city || '',
//             state: data.state || '',
//             zipcode: data.zipcode || '',
//           });

//           if (data.email) setIsEmailLocked(true);

//           setEducationData({
//             qualification: data.isStudying ? 'yes' : 'no',
//             institution: data.institution || '',
//           });

//           if (Array.isArray(data.projects)) {
//             setProjects(data.projects.map((p: Project) => ({ name: p.name, description: p.description })));
//           }
//         })
//         .catch(console.error);
//     }
//   }, [formId]);

//   // Input change handler
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     if (name === 'zipcode') {
//       if (!/^\d*$/.test(value)) {
//         setZipcodeError('Zipcode must be a number.');
//       } else if (value.length > 0 && value.length < 6) {
//         setZipcodeError('Zipcode must be exactly 6 digits.');
//       } else {
//         setZipcodeError('');
//       }
//     }

//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Save handlers for each page
//   const handleSavePage1 = async (): Promise<boolean> => {
//     if (!userId) {
//       alert("User is not logged in or token is invalid.");
//       return false;
//     }

//     const { name, email, address1, city, state, zipcode } = formData;
//     if (!name || !email || !address1 || !city || !state || !zipcode) {
//       alert("Please fill in all required fields.");
//       return false;
//     }

//     if (!/^\d{6}$/.test(zipcode)) {
//       alert("Zipcode must be a 6-digit number.");
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       alert("Please enter a valid email address.");
//       return false;
//     }

//     try {
//       if (formId) return true;

//       const res = await axios.post('http://localhost:3001/api/form/page1', { ...formData, userId });
//       if (res.data.message === "Email already exists") {
//         alert("This email has already been used.");
//         return false;
//       }

//       if (res.data.id) {
//         setFormId(res.data.id);
//         setIsEmailLocked(true);
//       }

//       return true;
//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         const message = err.response?.data?.error || err.response?.data?.message;
//         if (message?.includes("already been used")) {
//           alert("This email has already been used.");
//           return false;
//         }
//       }
//       console.error(err);
//       alert("Failed to save Page 1");
//       return false;
//     }
//   };

//   const handleSavePage2 = async (): Promise<boolean> => {
//     if (!educationData.qualification) {
//       alert("Please select your education status.");
//       return false;
//     }

//     if (educationData.qualification === 'yes' && !educationData.institution.trim()) {
//       alert("Please provide your institution name.");
//       return false;
//     }

//     try {
//       await axios.post('http://localhost:3001/api/form/page2', {
//         id: formId,
//         ...educationData,
//       });
//       return true;
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save Education Info');
//       return false;
//     }
//   };

//   const handleSavePage3 = async (): Promise<boolean> => {
//     if (!formId || projects.length === 0) {
//       alert('Missing form ID or projects');
//       return false;
//     }

//     for (const p of projects) {
//       if (!p.name.trim() || !p.description.trim()) {
//         alert("Please complete all project fields.");
//         return false;
//       }
//     }

//     try {
//       await axios.post('http://localhost:3001/api/form/page3', {
//         userFormId: formId,
//         projects,
//       });

//       setIsSubmitted(true);
//       return true;
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save Projects Info');
//       return false;
//     }
//   };

//   // Page navigation handler
//   const handleNavigation = async (nextPage: number): Promise<void> => {
//     let success = false;

//     if (currentPage === 1) success = await handleSavePage1();
//     else if (currentPage === 2) success = await handleSavePage2();
//     else if (currentPage === 3) {
//       success = nextPage > currentPage ? await handleSavePage3() : true;
//       if (success && nextPage > 3) return;
//     }

//     if (success) setCurrentPage(nextPage);
//   };

//   // Reusable input styles
//   const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 placeholder-gray-500";

//   // Render current page
//   const renderPage = () => {
//     switch (currentPage) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <input name="name" value={formData.name} onChange={handleChange} required placeholder="Name" className={inputStyles} />
//             <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputStyles} readOnly={isEmailLocked} />
//             <input name="address1" value={formData.address1} onChange={handleChange} required placeholder="Address Line 1" className={inputStyles} />
//             <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className={inputStyles} />
//             <input name="city" value={formData.city} onChange={handleChange} required placeholder="City" className={inputStyles} />
//           <label htmlFor="state" className="block mb-1 text-sm font-medium text-gray-700">
//   State
// </label>
// <select
//   id="state"
//   name="state"
//   value={formData.state}
//   onChange={handleChange}
//   className={inputStyles}
//   required
// >
//   <option value="">Select State</option>
//   {[
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
//     "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
//     "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
//     "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
//     "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
//   ].map(state => (
//     <option key={state} value={state}>{state}</option>
//   ))}
// </select>

//             <div>
//               <input name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" className={inputStyles} />
//               {zipcodeError && <p className="text-red-600 text-sm">{zipcodeError}</p>}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="space-y-4">
//             <p className="text-gray-700 font-medium">Are you still studying?</p>
//             <div className="flex gap-6">
//               <label className="flex items-center gap-2">
//                 <input type="radio" name="studying" value="yes" checked={educationData.qualification === 'yes'} onChange={() => setEducationData({ ...educationData, qualification: 'yes' })} />
//                 Yes
//               </label>
//               <label className="flex items-center gap-2">
//                 <input type="radio" name="studying" value="no" checked={educationData.qualification === 'no'} onChange={() => setEducationData({ ...educationData, qualification: 'no', institution: '' })} />
//                 No
//               </label>
//             </div>
//             {educationData.qualification === 'yes' && (
//               <input value={educationData.institution} onChange={e => setEducationData({ ...educationData, institution: e.target.value })} placeholder="Where are you studying?" className={inputStyles} />
//             )}
//           </div>
//         );
//       case 3:
//         return (
//           <div className="space-y-6">
//             {projects.map((p, idx) => (
//               <div key={idx} className="space-y-2 border rounded-md p-4 shadow-sm bg-white">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-semibold text-gray-700">Project {idx + 1}</h4>
//                   {projects.length > 1 && (
//                     <button onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-red-600 hover:underline text-sm">Remove</button>
//                   )}
//                 </div>
//                 <input value={p.name} onChange={e => {
//                   const newProjects = [...projects];
//                   newProjects[idx].name = e.target.value;
//                   setProjects(newProjects);
//                 }} placeholder="Project Name" className={inputStyles} />
//                 <textarea value={p.description} onChange={e => {
//                   const newProjects = [...projects];
//                   newProjects[idx].description = e.target.value;
//                   setProjects(newProjects);
//                 }} placeholder="Project Description" className={inputStyles} rows={4} />
//               </div>
//             ))}
//             <button onClick={() => setProjects([...projects, { name: '', description: '' }])} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm">
//               + Add Project
//             </button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-blue-900">
//     <div className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-white shadow-2xl rounded-3xl space-y-6">
//       {isSubmitted ? (
//         <div className="text-center space-y-4">
//           <h2 className="text-3xl font-bold text-green-600">Your response has been submitted successfully 🎉</h2>
//           <p className="text-gray-700">Thank you for filling out the form.</p>
//         </div>
//       ) : (
//         <>
//           <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
//             {currentPage === 1 ? 'Personal Info' : currentPage === 2 ? 'Education' : 'Projects'}
//           </h2>

//           {renderPage()}

//           {/* Navigation Controls */}
//           <div className="flex flex-col items-center gap-4">
//             <div className="flex items-center gap-2 text-gray-700 text-lg">
//               <button onClick={() => handleNavigation(Math.max(currentPage - 1, 1))} className="hover:text-blue-600">&lt;</button>
//               {[1, 2, 3].map(num => (
//                 <button key={num} onClick={() => handleNavigation(num)} className={currentPage === num ? 'font-bold text-blue-600' : 'hover:text-blue-600'}>
//                   {num}
//                 </button>
//               ))}
//               <button onClick={() => handleNavigation(Math.min(currentPage + 1, 3))} className="hover:text-blue-600">&gt;</button>
//             </div>
//             <div className="flex justify-between w-full">
//               <button onClick={() => handleNavigation(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50">
//                 <ArrowLeft size={18} /> Back
//               </button>
//               <button onClick={() => handleNavigation(currentPage === 3 ? 4 : currentPage + 1)} disabled={currentPage === 3 && projects.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
//                 {currentPage === 3 ? 'Submit' : 'Save & Continue'} <ArrowRight size={18} />
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div> </div>
//   );
// };

// export default Page1;







// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ArrowRight, ArrowLeft } from 'lucide-react';
// import { getUserIdFromToken } from '../utils/auth';

// type Project = { name: string; description: string };

// const Page1 = ({ formId, setFormId }: { formId: string | null; setFormId: (id: string) => void }) => {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [zipcodeError, setZipcodeError] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isEmailLocked, setIsEmailLocked] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     address1: '',
//     address2: '',
//     city: '',
//     state: '',
//     zipcode: ''
//   });

//   const [educationData, setEducationData] = useState({ qualification: '', institution: '' });
//   const [projects, setProjects] = useState<Project[]>([{ name: '', description: '' }]);

//   useEffect(() => {
//     const id = getUserIdFromToken();
//     setUserId(id);

//     if (id && !formId) {
//       axios.get(`http://localhost:3001/api/form/by-user/${id}`)
//         .then(res => {
//           if (res.data?.id) {
//             setFormId(res.data.id);
//           }
//         })
//         .catch(err => console.error("Failed to load form ID for user:", err));
//     }
//   }, []);

//   useEffect(() => {
//     const savedData = localStorage.getItem('formData');
//     if (savedData) {
//       setFormData(JSON.parse(savedData));
//     }
//   }, []);

//   useEffect(() => {
//     if (currentPage === 1) {
//       localStorage.setItem('formData', JSON.stringify(formData));
//     }
//   }, [currentPage, formData]);

//   useEffect(() => {
//     if (formId) {
//       axios.get(`http://localhost:3001/api/form/${formId}`)
//         .then(res => {
//           const data = res.data;
//           setFormData({
//             name: data.name || '',
//             email: data.email || '',
//             address1: data.address1 || '',
//             address2: data.address2 || '',
//             city: data.city || '',
//             state: data.state || '',
//             zipcode: data.zipcode || '',
//           });

//           if (data.email) setIsEmailLocked(true);

//           setEducationData({
//             qualification: data.isStudying ? 'yes' : 'no',
//             institution: data.institution || '',
//           });

//           if (Array.isArray(data.projects)) {
//             setProjects(data.projects.map((p: Project) => ({ name: p.name, description: p.description })));
//           }
//         })
//         .catch(console.error);
//     }
//   }, [formId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     if (name === 'zipcode') {
//       if (!/^\d*$/.test(value)) {
//         setZipcodeError('Zipcode must be a number.');
//       } else if (value.length > 0 && value.length < 6) {
//         setZipcodeError('Zipcode must be exactly 6 digits.');
//       } else {
//         setZipcodeError('');
//       }
//     }

//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSavePage1 = async (): Promise<boolean> => {
//     if (!userId) {
//       alert("User is not logged in or token is invalid.");
//       return false;
//     }

//     const { name, email, address1, city, state, zipcode } = formData;
//     if (!name || !email || !address1 || !city || !state || !zipcode) {
//       alert("Please fill in all required fields.");
//       return false;
//     }

//     if (!/^\d{6}$/.test(zipcode)) {
//       alert("Zipcode must be a 6-digit number.");
//       return false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       alert("Please enter a valid email address.");
//       return false;
//     }

//     try {
//       if (formId) return true;

//       const res = await axios.post('http://localhost:3001/api/form/page1', { ...formData, userId });
//       if (res.data.message === "Email already exists") {
//         alert("This email has already been used.");
//         return false;
//       }

//       if (res.data.id) {
//         setFormId(res.data.id);
//         setIsEmailLocked(true);
//       }

//       return true;
//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         const message = err.response?.data?.error || err.response?.data?.message;
//         if (message?.includes("already been used")) {
//           alert("This email has already been used.");
//           return false;
//         }
//       }
//       console.error(err);
//       alert("Failed to save Page 1");
//       return false;
//     }
//   };

//   const handleSavePage2 = async (): Promise<boolean> => {
//     if (!educationData.qualification) {
//       alert("Please select your education status.");
//       return false;
//     }

//     if (educationData.qualification === 'yes' && !educationData.institution.trim()) {
//       alert("Please provide your institution name.");
//       return false;
//     }

//     try {
//       await axios.post('http://localhost:3001/api/form/page2', {
//         id: formId,
//         ...educationData,
//       });
//       return true;
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save Education Info');
//       return false;
//     }
//   };

//   const handleSavePage3 = async (): Promise<boolean> => {
//     if (!formId || projects.length === 0) {
//       alert('Missing form ID or projects');
//       return false;
//     }

//     for (const p of projects) {
//       if (!p.name.trim() || !p.description.trim()) {
//         alert("Please complete all project fields.");
//         return false;
//       }
//     }

//     try {
//       await axios.post('http://localhost:3001/api/form/page3', {
//         userFormId: formId,
//         projects,
//       });

//       setIsSubmitted(true);
//       return true;
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save Projects Info');
//       return false;
//     }
//   };

//   const handleNavigation = async (nextPage: number): Promise<void> => {
//     let success = false;

//     if (currentPage === 1) success = await handleSavePage1();
//     else if (currentPage === 2) success = await handleSavePage2();
//     else if (currentPage === 3) {
//       success = nextPage > currentPage ? await handleSavePage3() : true;
//       if (success && nextPage > 3) return;
//     }

//     if (success) setCurrentPage(nextPage);
//   };

//   const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 placeholder-gray-500";

//   const renderPage = () => {
//     switch (currentPage) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <input name="name" value={formData.name} onChange={handleChange} required placeholder="Name" className={inputStyles} />
//             <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputStyles} readOnly={isEmailLocked} />
//             <input name="address1" value={formData.address1} onChange={handleChange} required placeholder="Address Line 1" className={inputStyles} />
//             <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className={inputStyles} />
//             <input name="city" value={formData.city} onChange={handleChange} required placeholder="City" className={inputStyles} />
//             <label htmlFor="state" className="block mb-1 text-sm font-medium text-gray-700">State</label>
//             <select
//               id="state"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className={inputStyles}
//               required
//             >
//               <option value="">Select State</option>
//               {[
//                 "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
//                 "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
//                 "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
//                 "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
//                 "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
//               ].map(state => (
//                 <option key={state} value={state}>{state}</option>
//               ))}
//             </select>
//             <div>
//               <input name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" className={inputStyles} />
//               {zipcodeError && <p className="text-red-600 text-sm">{zipcodeError}</p>}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="space-y-4">
//             <p className="text-gray-700 font-medium">Are you still studying?</p>
//             <div className="flex gap-6">
//               <label className="flex items-center gap-2">
//                 <input type="radio" name="studying" value="yes" checked={educationData.qualification === 'yes'} onChange={() => setEducationData({ ...educationData, qualification: 'yes' })} />
//                 Yes
//               </label>
//               <label className="flex items-center gap-2">
//                 <input type="radio" name="studying" value="no" checked={educationData.qualification === 'no'} onChange={() => setEducationData({ ...educationData, qualification: 'no', institution: '' })} />
//                 No
//               </label>
//             </div>
//             {educationData.qualification === 'yes' && (
//               <input value={educationData.institution} onChange={e => setEducationData({ ...educationData, institution: e.target.value })} placeholder="Where are you studying?" className={inputStyles} />
//             )}
//           </div>
//         );
//       case 3:
//         return (
//           <div className="space-y-6">
//             {projects.map((p, idx) => (
//               <div key={idx} className="space-y-2 border rounded-md p-4 shadow-sm bg-white">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-semibold text-gray-700">Project {idx + 1}</h4>
//                   {projects.length > 1 && (
//                     <button onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-red-600 hover:underline text-sm">Remove</button>
//                   )}
//                 </div>
//                 <input value={p.name} onChange={e => {
//                   const newProjects = [...projects];
//                   newProjects[idx].name = e.target.value;
//                   setProjects(newProjects);
//                 }} placeholder="Project Name" className={inputStyles} />
//                 <textarea value={p.description} onChange={e => {
//                   const newProjects = [...projects];
//                   newProjects[idx].description = e.target.value;
//                   setProjects(newProjects);
//                 }} placeholder="Project Description" className={inputStyles} rows={4} />
//               </div>
//             ))}
//             <button onClick={() => setProjects([...projects, { name: '', description: '' }])} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm">
//               + Add Project
//             </button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-blue-950">
//       <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
//         {isSubmitted ? (
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold text-green-600">Your response has been submitted successfully 🎉</h2>
//             <p className="text-gray-700">Thank you for filling out the form.</p>
//           </div>
//         ) : (
//           <>
//             <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
//               {currentPage === 1 ? 'Personal Info' : currentPage === 2 ? 'Education' : 'Projects'}
//             </h2>

//             {renderPage()}

//             {/* Navigation Controls */}
//             <div className="flex flex-col items-center gap-4">
//               <div className="flex items-center gap-2 text-gray-700 text-lg">
//                 <button onClick={() => handleNavigation(Math.max(currentPage - 1, 1))} className="hover:text-blue-600">&lt;</button>
//                 {[1, 2, 3].map(num => (
//                   <button key={num} onClick={() => handleNavigation(num)} className={currentPage === num ? 'font-bold text-blue-600' : 'hover:text-blue-600'}>
//                     {num}
//                   </button>
//                 ))}
//                 <button onClick={() => handleNavigation(Math.min(currentPage + 1, 3))} className="hover:text-blue-600">&gt;</button>
//               </div>
//               <div className="flex justify-between w-full">
//                 <button onClick={() => handleNavigation(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 disabled:opacity-50" >
//                   <ArrowLeft size={18} /> Back
//                 </button>
//                 <button onClick={() => handleNavigation(currentPage + 1)} disabled={currentPage === 3 && isSubmitted} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 disabled:opacity-50" >
//                   Next <ArrowRight size={18} />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Page1;
