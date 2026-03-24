import React, { useEffect, useState } from "react";
import { message, Pagination } from "antd";
import {
  getBlogApi,
  deleteBlogApi,
  getAllCommentsApi,
  approveCommentApi,
} from "../../common/services";
import Load from "../Load/Load";
import EditModal from "./EditModal";
import ViewModal from "./ViewModal";
import CommentsModal from "./CommentsModal";
import {
  AiFillEdit,
  AiOutlineEye,
  AiFillDelete,
  AiOutlineComment,
} from "react-icons/ai";
import DeleteModal from "../deleteModal/DeleteModal";
import { errorResponseHandler } from "../../common/http";
import AddModal from "./AddModal";
import { image_url } from "../../common/env";

const Blogs = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [showUpdateBlog, setShowUpdateBlog] = useState(false);
  const [showDeleteBlog, setShowDeleteBlog] = useState(false);
  const [action, setAction] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState({});
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentsData, setCommentsData] = useState([]);

  const handleView = (data) => {
    setShowView(true);
    setViewData(data);
  };

  const handleComments = async (blog) => {
    try {
      setShowComments(true);
      const response = await getAllCommentsApi(blog.id);
      if (response?.success) {
        const blogComments = response.data.filter(
          (comment) => comment.blogId === blog._id,
        );
        setCommentsData(blogComments);
      }
    } catch (error) {
      errorResponseHandler(error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = allBlogs.slice(indexOfFirstItem, indexOfLastItem);

  const getAllBlogs = async () => {
    try {
      const response = await getBlogApi();
      if (response?.success) {
        const reverseData = [...response?.data].reverse();
        setAllBlogs(reverseData);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return;
    try {
      const response = await deleteBlogApi(selectedBlog.id);
      if (response?.success) {
        message.success("Blog deleted successfully");
        getAllBlogs();
        setAction(!action);
        setShowDeleteBlog(false);
      }
    } catch (error) {
      errorResponseHandler(error);
    }
  };

  useEffect(() => {
    getAllBlogs();
  }, [action]);

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h3 className="text-2xl font-bold text-black">Blogs</h3>
        <button
          onClick={() => setShowCreateBlog(true)}
          className="bg-[#1d2532] text-white font-bold py-2 px-8 rounded"
        >
          Add Blog
        </button>
      </div>

      <div>
        <table className="w-full mt-7 bg-[#1d2532] border border-b-4 text-sm table-auto">
          <thead>
            <tr>
              <th className="py-2 px-2 border-b text-center w-1/12 text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center w-2/12 text-white">
                Image
              </th>
              <th className="py-2 px-4 border-b text-center w-3/12 text-white">
                Title
              </th>
              <th className="py-2 px-2 border-b text-center w-1/12 text-white">
                Comments
              </th>
              <th className="py-2 px-2 border-b text-center w-1/12 text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBlogs?.length > 0 ? (
              currentBlogs.map((blog, index) => (
                <tr
                  key={blog.id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-300"}`}
                >
                  <td className="py-2 px-2 border-b">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {blog.imageUrl ? (
                      <img
                        src={`${image_url}/${blog.imageUrl}`}
                        alt="Blog"
                        className="w-16 h-16 object-cover mx-auto"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="py-2 px-4 border-b break-words">
                    {blog.title}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleComments(blog)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <AiOutlineComment className="text-xl" />
                    </button>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-row justify-center">
                      <button
                        onClick={() => handleView(blog)}
                        className="mr-2 text-blue-500 hover:text-blue-700"
                      >
                        <AiOutlineEye className="text-xl" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setShowUpdateBlog(true);
                        }}
                        className="mr-2 text-blue-500 hover:text-blue-700"
                      >
                        <AiFillEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setShowDeleteBlog(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <AiFillDelete className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No blog data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <Load />}
      </div>

      {currentBlogs?.length > 0 && (
        <Pagination
          current={currentPage}
          total={allBlogs.length}
          pageSize={itemsPerPage}
          onChange={setCurrentPage}
          showSizeChanger={false}
          className="mt-6 flex justify-end"
        />
      )}

      {showCreateBlog && (
        <AddModal
          showCreateBlog={showCreateBlog}
          setShowCreateBlog={setShowCreateBlog}
          action={action}
          setAction={setAction}
        />
      )}

      {showView && <ViewModal setShowView={setShowView} data={viewData} />}

      {showUpdateBlog && (
        <EditModal
          showUpdateBlog={showUpdateBlog}
          setShowUpdateBlog={setShowUpdateBlog}
          selectedBlog={selectedBlog}
          action={action}
          setAction={setAction}
        />
      )}

      {showDeleteBlog && (
        <DeleteModal
          onClose={() => setShowDeleteBlog(false)}
          handleDelete={handleDeleteBlog}
        />
      )}

      {showComments && (
        <CommentsModal
          showComments={showComments}
          setShowComments={setShowComments}
          commentsData={commentsData}
          setCommentsData={setCommentsData}
        />
      )}
    </div>
  );
};

export default Blogs;
