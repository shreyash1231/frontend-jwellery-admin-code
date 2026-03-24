import React, { useState } from 'react'
import { useFormik } from 'formik'
import { updateFaqsApi } from '../../common/services'
import * as Yup from 'yup'
import { message } from 'antd'
import { errorResponseHandler } from '../../common/http'

function EditEmployeeFaq({ showUpdateFaq, setShowUpdateFaq, selectedFaq, action, setAction }) {
    const [open, setOpen] = useState(showUpdateFaq)
    const [loading, setLoading] = useState(false)

    const closeEditMOdal = () => {
        setOpen(false)
        setShowUpdateFaq(false)
    }

    const formik = useFormik({
        initialValues: {
            question: selectedFaq.question,
            answer: selectedFaq.answer
        },
        validationSchema: Yup.object({
            question: Yup.string().required("Question is required").trim("Question should not contain spaces").max(100, "Question can not be more than 100 characters long"),
            answer: Yup.string().required("Answer is required").trim("Asnwer should not contain spaces").max(1000, "Answer can not be more than 1000 characters long"),
        }),
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {

                setLoading(true)
                const data = {
                    "question": values.question,
                    "answer": values.answer

                }

                const response = await updateFaqsApi(selectedFaq.id, data)
                if (response?.success) {
                    message.success("Faq Updated successfully")
                    resetForm()
                    setOpen(false)
                    setShowUpdateFaq(false)
                    setAction(!action)
                }

            } catch (error) {
                errorResponseHandler(error)
              
            } finally {
                setSubmitting(false)
                setLoading(false)
            }
        }
    })


    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white  rounded-2xl shadow-lg w-[900px] h-[500px] overflow-y-auto">

                <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
                    Update FAQ
                </h3>
                <form onSubmit={formik.handleSubmit} className='p-8'>
                    <div className='w-full'>
                        <label className='block mb-2 text-xl font-bold '>Question</label>
                        <input
                            type='text'
                            name='question'
                            className='border border-gray-900 p-2 w-full'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.question}
                            placeholder='Enter the question'
                        />
                        {formik.touched.question && formik.errors.question && (
                            <p className='text-red-600'>{formik.errors.question}</p>
                        )}
                    </div>

                    <div className='w-full mt-8'>
                        <label className='block mb-2 text-xl font-bold'>Answer</label>
                        <textarea
                            rows={5}
                            type='text'
                            name='answer'
                            className='border border-gray-900 p-2 w-full'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.answer}
                            placeholder='Enter your answer'
                        />
                        {formik.touched.answer && formik.errors.answer && (
                            <p className='text-red-600'>{formik.errors.answer}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-6 mt-6">
                        <button
                            onClick={closeEditMOdal}
                            className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#1d2532] text-white py-2 px-4 rounded-md w-52 transition duration-200 mr-2"
                        >
                            {formik.isSubmitting ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default EditEmployeeFaq