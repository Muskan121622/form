import { useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Page2Props {
  formId: string | null;
  onNext: () => void;
  onBack: () => void;
}

const Page2 = ({ formId, onNext, onBack }: Page2Props) => {
  const formik = useFormik({
    initialValues: {
      isStudying: true,
      institution: '',
    },
    validationSchema: Yup.object({
      isStudying: Yup.boolean().required(),
      institution: Yup.string().when('isStudying', {
        is: true,
        then: schema => schema.required('Institution is required'),
        otherwise: schema => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post('http://localhost:3001/api/form/page2', {
          id: formId,
          ...values,
          institution: values.isStudying ? values.institution : '', // clears if not studying
        });
        onNext();
      } catch (err) {
        console.error(err);
        alert('Failed to save education data');
      }
    },
  });

  useEffect(() => {
    if (formId) {
      axios
        .get(`http://localhost:3001/api/form/${formId}`)
        .then((res) => {
          formik.setValues({
            isStudying: res.data.isStudying ?? true,
            institution: res.data.institution || '',
          });
        })
        .catch((err) => console.error(err));
    }
  }, [formId]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Educational Status</h2>

      <div className="space-y-4">
        <p className="text-gray-700">Are you still studying?</p>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="radio"
              name="isStudying"
              value="true"
              checked={formik.values.isStudying === true}
              onChange={() => formik.setFieldValue('isStudying', true)}
              className="accent-blue-600"
            />
            Yes
          </label>

          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="radio"
              name="isStudying"
              value="false"
              checked={formik.values.isStudying === false}
              onChange={() => formik.setFieldValue('isStudying', false)}
              className="accent-blue-600"
            />
            No
          </label>
        </div>

        {formik.values.isStudying && (
          <div>
            <input
              type="text"
              name="institution"
              placeholder="Where are you studying?"
              value={formik.values.institution}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.institution && formik.errors.institution && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.institution}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <span className="text-gray-500">Page <strong>2</strong> of 3</span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Save & Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="text-center pt-2 text-gray-500">
        &lt; <span className="text-blue-600 font-semibold">1</span> |{' '}
        <span className="text-blue-600 font-semibold">2</span> | 3 &gt;
      </div>
    </form>
  );
};

export default Page2;
