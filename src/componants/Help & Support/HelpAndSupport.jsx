import React from 'react'

const HelpAndSupport = () => {
  return (
    <div>HelpAndSupport</div>
  )
}

export default HelpAndSupport


// import { useContext, useEffect, useState } from "react";
// import "react-quill/dist/quill.snow.css";
// import Load from '../Load/Load'
// import ReactQuill from "react-quill";
// import { getHelpAndSuport, updateSupportData, createSupportData } from "../../Web Apis/webApis"
// import { message } from "antd";
// import { useNavigate } from "react-router";


// const HelpAndSupport = () => {
//   const navigate = useNavigate();
//   // const { setIsAuthenticated } = useContext(UserContext);
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState({});
//   const [email, setEmail] = useState("")
//   const [text, setText] = useState("");
//   const [disableStatus, setDisableStatus] = useState(true);

//   const stripHtml = (html) => {
//     const tempDiv = document.createElement("div");
//     tempDiv.innerHTML = html;
//     return tempDiv.textContent || tempDiv.innerText || "";
//   };
  

//   // Fetch Terms and Conditions from API
//   const fetchSupportData = async () => {
//     setLoading(true);
//     try {

//       const response = await getHelpAndSuport();
//         if (response?.success) {
//         const supportData = response?.data.filter((item) => item.title === "Help")[0];
//         setData(supportData);
//         setText(supportData?.description || "");
//         setEmail(supportData?.contactUsEmail || "")
//       }
//     } catch (error) {
//       console.error("Error fetching terms and conditions:", error);
//       if (error.message === 'Network Error' || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
//         // Handle internet disconnection
//         return;
//       }
//       // Handle specific error cases
//       if (error?.response?.status === 401) {
//         window.alert("Your account is logged in to another device, please login again !")
//         localStorage.removeItem('token');
//         // setIsAuthenticated(false)
//         window.location.href = "/login";
//       }
//       if (error?.response?.status === 500) {
//         message.error("Server not responding")
//         return;
//       }

//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create Terms and Conditions
//   const createHelpAndSupportData = async () => {
//     setLoading(true);
//     try {
//       const plainText = stripHtml(text).trim();

//       if (!plainText) {
//         message.error("Please provide content for help & support.");
//         setLoading(false);
//         return;
//       }

//       if(!email || email===""){
//         message.error("Please provide support email")
//         return;
//       }

//       // ✅ Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       message.error("Please enter a valid email address");
//       setLoading(false);
//       return;
//     }

//       const response = await createSupportData({ content: text, contactUsEmail: email });
//       if (response?.data?.success) {
//         message.success(response?.data?.message);
//         await fetchSupportData();
//       }
//     } catch (error) {
//       console.error("Error creating terms and conditions:", error);
//       if (error.message === 'Network Error' || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
//         // Handle internet disconnection
//         return;
//       }
//       // Handle specific error cases
//       if (error?.response?.status === 401) {
//         window.alert("Your account is logged in to another device, please login again !")
//         localStorage.removeItem('token');
//         navigate("/login")
//       }
//       if (error?.response?.status === 500) {
//         message.error("Server not responding")
//       } else {
//         message.error(error?.response?.data?.message || "Error while creating help & support");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update Terms and Conditions
//   const updateHelpAndSupportData = async () => {
//     setLoading(true);
//     try {


//       if(!email || email===""){
//         message.error("Please provide support email")
//         return;
//       }

//       if(!text || text===""){
//         message.error("Please provide text in the content !")
//         return ;
//       }

//       const plainText = stripHtml(text).trim();

//       if (!plainText) {
//         message.error("Please provide content for help & support.");
//         setLoading(false);
//         return;
//       }


//         // ✅ Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       message.error("Please enter a valid email address");
//       setLoading(false);
//       return;
//     }



//       const response = await updateSupportData(data.id, { content: text, contactUsEmail: email });
//       if (response?.data?.success) {
//         message.success(response?.data?.message);
//         setDisableStatus(true);
//       }
//     } catch (error) {
//       console.error("Error updating terms and conditions:", error);
//       message.error(error?.response?.data?.message || "Error while updating help & support");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSupportData();
//   }, []);

//   // Handle content change in ReactQuill editor
//   const handleChange = (value) => {
//     setText(value);
//     setDisableStatus(false); // Enable button when content changes
//   };

//   const handleEmailChange = (e) => {
//     setEmail(e.target.value)
//     setDisableStatus(false)
//   }

//   return (

//     <div className="mt-28">

//     <div style={{ width: "90%", margin: "0px auto" }}>
//         <div style={{ marginTop: "50px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//             <h1 style={{ fontSize: "22px", fontWeight: 600 }}>Help & Support</h1>

//           </div>
//           <div className="w-full">
//             <label className="block mb-1 mt-8 text-xl font-bold">Support Email </label>
//             <input
//               type="email"
//               name="supportEmail"
//               className="border border-gray-300 p-2 w-full "
//               onChange={handleEmailChange}
//               value={email}
//               placeholder='Enter support email'
//             />
//           </div>
//           <label className="block mb-1 mt-4 text-xl font-bold">Content </label>
//           <ReactQuill
//             value={text}
//             onChange={handleChange}
//             placeholder="Write your help and support content here..."
//             theme="snow"
//             className="mb-4"
//             style={{ height: "300px", zIndex: "-1" , position: "relative" }}
//           />
//         </div>
//       </div>
//       <div className="flex flex-row justify-end items-center w-full">
//         <button
//           onClick={data?.id ? updateHelpAndSupportData : createHelpAndSupportData}
//           disabled={disableStatus}
//           style={{
//             backgroundColor: disableStatus ? "grey" : "teal",
//             color: "#fff",
//             padding: "10px 20px",
//             borderRadius: "10px",
//             marginTop: "60px",
//             marginRight: "80px",
//           }}
//         >
//           {data?.id ? "Update help and support" : "Create help and support"}
//         </button>
//       </div>
//       {loading && <Load />}


//     </div>
      

//   );
// };

// export default HelpAndSupport;

