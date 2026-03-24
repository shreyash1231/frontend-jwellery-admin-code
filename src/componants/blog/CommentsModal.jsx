import React, { useState } from 'react'
import { Switch, message } from 'antd'
import { approveCommentApi, rejectCommentApi } from '../../common/services'
import { errorResponseHandler } from '../../common/http'

const CommentsModal = ({ showComments, setShowComments, commentsData, setCommentsData }) => {
    const [loading, setLoading] = useState(false)

    const handleClose = () => {
        setShowComments(false)
    }

    const handleToggle = async (commentId, currentStatus) => {
        try {
            setLoading(true)
            if (!currentStatus) {
                const response = await approveCommentApi(commentId)
                if (response?.success) {
                    message.success('Comment approved successfully')
                    setCommentsData(prev =>
                        prev.map(comment =>
                            comment.id === commentId
                                ? { ...comment, isApproved: true, isRejected: false }
                                : comment
                        )
                    )
                }
            } else {
                const response = await rejectCommentApi(commentId)
                if (response?.success) {
                    message.success('Comment rejected successfully')
                    setCommentsData(prev =>
                        prev.map(comment =>
                            comment.id === commentId
                                ? { ...comment, isApproved: false, isRejected: true }
                                : comment
                        )
                    )
                }
            }
        } catch (error) {
            errorResponseHandler(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[900px] h-[80vh] overflow-y-auto relative">
                <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
                    Manage Comments
                </h3>
                <div className='p-8'>
                    {commentsData.length > 0 ? (
                        <div className="space-y-4">
                            {commentsData.map((comment) => (
                                <div key={comment.id} className="border border-gray-300 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{comment.userName || 'Anonymous'}</p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">
                                                {comment.isRejected ? 'Rejected' : comment.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                            <Switch
                                                checked={comment.isApproved}
                                                onChange={() => handleToggle(comment.id, comment.isApproved)}
                                                loading={loading}
                                                disabled={comment.isRejected}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-[60vh]">
                            <p className="text-gray-500 text-center">No comments found for this blog.</p>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleClose}
                            className="bg-gray-300 text-black w-32 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommentsModal
