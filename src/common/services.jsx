import { errorResponseHandler, http } from "./http";
import endpoints from "./endpoints";
import { baseUrl } from "./env";
import axios from "axios";

const token = sessionStorage.getItem("token");

export const login = async (data) => {
  return http.post(`${endpoints.login}`, data);
};

export const sendOtp = async (data) => {
  return http.post(`${endpoints.sendOtp}`, data);
};

export const forgotPasswordApi = async (data) => {
  return http.post(`${endpoints.forgotPassword}`, data);
};

export const verifyOtp = async (data) => {
  return http.post(`${endpoints.verifyOtp}`, data);
};

export const resetPassword = async (data) => {
  return http.resetPassword(`${endpoints.resetPassword}`, data);
};

export const changePassword = async (data) => {
  return http.patch(`${endpoints.changePassword}`, data);
};

export const getAllBannersApi = async () => {
  return http.get(`${endpoints.getAllBanners}`);
};

export const getAnalyticsApi = async () => {
  return http.get(`${endpoints.analytics}`);
};

export const getAboutUsApi = async () => {
  return http.get(`${endpoints.aboutus}`);
};
export const deleteAboutUsApi = async (id) => {
  return http.delete(`${endpoints.aboutus}/${id}`);
};

export const addAboutUsApi = async (data) => {
  return http.postFormData(`${endpoints.aboutus}`, data);
};

export const updateAboutUsApi = async (id, data) => {
  return http.patchFormData(`${endpoints.aboutus}/${id}`, data);
};

export const customOrderApi = async () => {
  return http.get(`${endpoints.customOrders}`);
};

export const updateCustomOrderStatusApi = async (id, status) => {
  return http.patch(`${endpoints.customOrders}/${id}`, status);
};

export const deleteBannerApi = async (id) => {
  return http.delete(`${endpoints.deleteBanner}/${id}`);
};

export const updateBannerApi = async (id, data) => {
  return http.patchFormData(`${endpoints.updateBanner}/${id}`, data);
};

export const addBannerApi = async (data) => {
  return http.postFormData(`${endpoints.addBanner}`, data);
};

export const addCouponApi = async (data) => {
  return http.post(`${endpoints.addCoupon}`, data);
};

export const getAllCouponsApi = async () => {
  return http.get(`${endpoints.getAllCoupons}`);
};

export const deleteCouponApi = async (id) => {
  return http.delete(`${endpoints.deleteCoupon}/${id}`);
};

export const updateCouponApi = async (id, data) => {
  return http.patch(`${endpoints.updateCoupon}/${id}`, data);
};

export const getAllUsersApi = async () => {
  return http.get(`${endpoints.getAllUsers}`);
};

export const addReelsApi = async (data) => {
  return http.postFormData(`${endpoints.addReels}`, data);
};

export const getAllReelsApi = async () => {
  return http.get(`${endpoints.getAllReels}`);
};

export const deleteReelApi = async (id) => {
  return http.delete(`${endpoints.deleteReel}/${id}`);
};

export const updateReelApi = async (id, data) => {
  return http.patchFormData(`${endpoints.updateReel}/${id}`, data);
};

export const deleteProductImageApi = async (productId, data) => {
  return http.patch(`${endpoints.deleteProductImage}/${productId}`, {
    data,
  });
};

export const getAllSignatureApi = async () => {
  return http.get(`${endpoints.getAllSignature}`);
};

export const deleteSignatureApi = async (id) => {
  return http.delete(`${endpoints.deleteSignature}/${id}`);
};

export const updateSignatureApi = async (id, data) => {
  return http.patchFormData(`${endpoints.updateSignature}/${id}`, data);
};

export const addSignatureApi = async (data) => {
  return http.postFormData(`${endpoints.addSignature}`, data);
};

export const getAllOrdersApi = async () => {
  return http.get(`${endpoints.getAllOrders}`);
};

export const updateOrderApi = async (id, data) => {
  return http.patch(`${endpoints.updateOrder}/${id}`, data);
};

export const getAllPaymentsApi = async () => {
  return http.get(`${endpoints.getAllPayments}`);
};



export const getAllCommentsApi = async (id) => {
  return http.get(`${endpoints.getAllComments}/${id}`);
};

export const approveCommentApi = async (id) => {
  return http.patch(`${endpoints.approveComment}/${id}`);
};

export const rejectCommentApi = async (id) => {
  return http.patch(`${endpoints.rejectComment}/${id}`);
};

export const getProfileApi = async (id) => {
  return http.get(`${endpoints.profile}/${id}`);
};

export const deactivate = async (id) => {
  return http.delete(`${endpoints.deactivate}/${id}`);
};


export const updateServiceApi = async (id, data) => {
  return http.patchFormData(`${endpoints.updateService}/${id}`, data);
};

export const deleteImageApi = async (id, imageUrl) => {
  try {
    // Get token from localStorage

    const response = await axios.delete(
      `${baseUrl}${endpoints.deleteImage}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { imageUrl }, // pass imageUrl in request body
      },
    );

    return response.data;
  } catch (error) {
    errorResponseHandler(error);
  }
};

export const getUserBookingHistoryApi = async (id) => {
  return http.get(`${endpoints.userBookingHistory}/${id}`);
};





export const updateUserProfileApi = async (id, data) => {
  return http.patch(`${endpoints.updateUserProfile}/${id}`, data);
};
export const getProviderAvailabilityApi = async (id) => {
  return http.get(`${endpoints.providerAvailability}/${id}`);
};


export const getbookservices = async () => {
  return http.get(`${endpoints.bookServices}`);
};

export const deleteBookService = async (id) => {
  return http.delete(`${endpoints.deleteBookService}/${id}`);
};

export const addBookService = async (data) => {
  return http.postFormData(`${endpoints.addBookService}`, data);
};

export const updateBookService = async (id, data) => {
  return http.patchFormData(`${endpoints.updateBookService}/${id}`, data);
};

export const getOffers = async () => {
  return http.get(`${endpoints.getAllOffer}`);
};

export const deleteOffer = async (id) => {
  return http.delete(`${endpoints.deleteOffer}/${id}`);
};

export const addOffer = async (data) => {
  return http.post(`${endpoints.addOffer}`, data);
};

export const updateOffer = async (id, data) => {
  return http.patch(`${endpoints.updateOffer}/${id}`, data);
};


export const updateProfileApi = async (data) => {
  return http.patchFormData(`${endpoints.updateProfile}`, data);
};

export const staticContent = async (data) => {
  return http.get(`${endpoints.allContent}`, data);
};

export const updateContent = async (id, { content }) => {
  return http.patch(`${endpoints.updateContent}/${id}`, { content: content });
};

export const createContent = async (data) => {
  return http.post(`${endpoints.createContent}`, data);
};

export const getAllUsers = async () => {
  return http.get(`${endpoints.getAllUser}`);
};

export const getAllPayments = async () => {
  return http.get(`${endpoints.getAllPayments}`);
};

export const getDashboardApi = async () => {
  return http.get(`${endpoints.dashboard}`);
};


export const addFaqApi = (data) => {
  return http.post(`${endpoints.addFaq}`, data);
};

export const deleteFaqsApi = (id) => {
  return http.delete(`${endpoints.deleteFaqs}/${id}`);
};

export const updateFaqsApi = (id, data) => {
  return http.patch(`${endpoints.editFaqs}/${id}`, data);
};

export const getAllFaqApi = () => {
  return http.get(`${endpoints.getFaqs}`);
};





export const getNewsLettersApi = () => {
  return http.get(`${endpoints.getNewsLetters}`);
};

export const getUserInfoApi = () => {
  return http.get(`${endpoints.getUserInfo}`);
};

export const addDetailsApi = (data) => {
  return http.post(`${endpoints.addDetails}`, data);
};

export const getDetailsApi = () => {
  return http.get(`${endpoints.getDetails}`);
};

export const updateDetailsApi = (id, data) => {
  return http.patch(`${endpoints.updateDetails}/${id}`, data);
};

export const getAllQueriesApi = () => {
  return http.get(`${endpoints.getQueries}`);
};

export const updateDomainApi = (id, data) => {
  return http.patchFormData(`${endpoints.updateDomain}/${id}`, data);
};

export const addDomainApi = (data) => {
  return http.postFormData(`${endpoints.addDomain}`, data);
};




export const deleteDomainApi = (id) => {
  return http.delete(`${endpoints.deleteDomain}/${id}`);
};

export const getDomainsApi = () => {
  return http.get(`${endpoints.getAllDomain}`);
};



export const shopByProd=()=>{
  return http.get(`${endpoints.shopByProd}`)
}

export const shopByFunc=()=>{
  return http.get(`${endpoints.shopByFunc}`)
}



export const getAllProjectsApi = () => {
  return http.get(`${endpoints.getAllProjects}`);
};

export const addProjectApi = (data) => {
  return http.postFormData(`${endpoints.addProject}`, data);
};

export const deleteProjectApi = (id) => {
  return http.delete(`${endpoints.deleteProject}/${id}`);
};

export const updateProjectApi = (id, data) => {
  return http.patchFormData(`${endpoints.updateProject}/${id}`, data);
};


