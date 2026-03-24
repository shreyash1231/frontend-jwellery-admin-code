import React, { useEffect, useState } from 'react'
import { message, Pagination } from 'antd'
import { getAllFaqApi, deleteFaqsApi } from '../../common/services'
import Load from '../Load/Load'
import EditModal from './EditModal';
import ViewModal from './ViewModal';
import { AiFillEdit, AiOutlineEye, AiFillDelete } from "react-icons/ai";
import DeleteModal from '../deleteModal/DeleteModal';
import { errorResponseHandler } from '../../common/http';
import AddModal from "./AddModal"

const Faqs = () => {
    const [allFaqs, setAllFaqs] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [loading, setLoading] = useState(true)
    const [showCreateFaq, setShowCreateFaq] = useState(false)
    const [showUpdateFaq, setShowUpdateFaq] = useState(false)
    const [showDeleteFaq, setShowDeleteFaq] = useState(false)
    const [action, setAction] = useState(false)
    const [selectedFaq, setSelectedFaq] = useState({})
    const [showView, setShowView] = useState(false)
    const [viewData, setViewData] = useState(null)



    const handleView = (data) => {
        setShowView(true)
        setViewData(data)
    }



    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentFaqs = allFaqs.slice(indexOfFirstItem, indexOfLastItem)

    const getAllFaqs = async () => {
        try {
            const response = await getAllFaqApi();
            if (response?.success) {
                const reverseData = [...response?.data].reverse()
                setAllFaqs(reverseData)
            }
        } catch (error) {
            errorResponseHandler(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteEmployeeFaqs = async () => {
        if (!selectedFaq) return
        try {
            const response = await deleteFaqsApi(selectedFaq.id)
            if (response?.success) {
                message.success("Faq deleted successfully")
                setAction(!action)
                setShowDeleteFaq(false)
            }
        } catch (error) {
            errorResponseHandler(error)
        }
    }

    useEffect(() => {
        getAllFaqs()
    }, [action])



    return (
        <div className='p-4 mt-16'>
            <div className="flex justify-between items-center w-full space-x-4">
                <h3 className='text-2xl font-bold text-black'>Frequently Asked Questions </h3>
                <button
                    onClick={() => setShowCreateFaq(true)}
                    className="bg-[#1d2532] text-white font-bold py-2 px-8 rounded"
                >
                    Add More
                </button>
            </div>

            <div>
                <table className="w-full mt-7 bg-[#1d2532] border border-b-4 text-sm table-auto">
                    <thead>
                        <tr>
                            <th className="py-2 px-2 border-b text-center w-1/12 text-white">S.No</th>
                            <th className="py-2 px-4 border-b text-center w-5/12 text-white">Questions</th>
                            <th className="py-2 px-2 border-b text-center w-1/12 text-white">Action </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentFaqs?.length > 0 ? (
                            currentFaqs.map((faqs, index) => (
                                <tr key={faqs._id}
                                    className={`hover:bg-gray-200 text-center transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-300'}`}
                                >
                                    <td className='py-2 px-2 border-b'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className='py-2 px-4 border-b break-words'>{faqs.question}</td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex flex-row justify-center">
                                            <button onClick={() => handleView(faqs)} className="mr-2 text-blue-500 hover:text-blue-700">
                                                <AiOutlineEye className="text-xl" />
                                            </button>
                                            <button onClick={() => { setSelectedFaq(faqs); setShowUpdateFaq(true) }} className="mr-2 text-blue-500 hover:text-blue-700">
                                                <AiFillEdit className="text-xl" />
                                            </button>
                                            <button onClick={() => { setSelectedFaq(faqs); setShowDeleteFaq(true) }} className="text-red-500 hover:text-red-700">
                                                <AiFillDelete className="text-xl" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className='px-4 py-4 border-b text-center text-white font-bold'>
                                    No FAQ data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {loading && <Load />}
            </div>

            {currentFaqs?.length > 0 && (
                <Pagination
                    current={currentPage}
                    total={allFaqs.length}
                    pageSize={itemsPerPage}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    className="mt-6 flex justify-end"
                />
            )}

            {showCreateFaq && (
                <AddModal
                    showCreateFaq={showCreateFaq}
                    setShowCreateFaq={setShowCreateFaq}
                    action={action}
                    setAction={setAction}
                />
            )}

            {showView && (
                <ViewModal setShowView={setShowView} data={viewData} />
            )}

            {showUpdateFaq && (
                <EditModal
                    showUpdateFaq={showUpdateFaq}
                    setShowUpdateFaq={setShowUpdateFaq}
                    selectedFaq={selectedFaq}
                    action={action}
                    setAction={setAction}
                />
            )}

            {showDeleteFaq && (
                <DeleteModal onClose={() => setShowDeleteFaq(false)} handleDelete={handleDeleteEmployeeFaqs} />
            )}
        </div>
    )
}

export default Faqs
