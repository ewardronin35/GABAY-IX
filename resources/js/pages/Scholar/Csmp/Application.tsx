
import React, { useState, FormEventHandler } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
registerPlugin(FilePondPluginImagePreview);

const InputLabel = ({ value, className = '', children, ...props }: any) => (
  <label {...props} className={`block font-medium text-sm text-gray-700 dark:text-gray-300 ${className}`}>
    {value ? value : children}
  </label>
);

const TextInput = ({ className = '', ...props }: any) => (
  <input
    {...props}
    className={
      `py-3 px-4 border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${className}`
    }
  />
);

const SelectInput = ({ className = '', children, ...props }: any) => (
  <select
    {...props}
    className={
      `py-3 px-4 border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${className}`
    }
  >
    {children}
  </select>
);

const InputError = ({ message, className = '' }: { message?: string, className?: string }) => (
  message ? <p className={`text-sm text-red-600 dark:text-red-400 ${className}`}>{message}</p> : null
);

const Checkbox = ({ className = '', ...props }: any) => (
  <input
    {...props}
    type="checkbox"
    className={
      `rounded border-gray-300 dark:border-gray-700 text-indigo-600 dark:text-indigo-500 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 ${className}`
    }
  />
);

export default function Apply({ auth, profilePhotoUrl }: PageProps & { profilePhotoUrl: string | null }) {

  console.log('Application.tsx component rendered. Received profilePhotoUrl:', profilePhotoUrl);
  if (!auth.user) {
        return null; // Or a loading/error indicator
    }
  const [currentStep, setCurrentStep] = useState(1);
// Use the new prop here
const [files, setFiles] = useState<any[]>(
    // --- THIS IS THE FIX ---
    // Only load the file if it's NOT a Google URL.
    (profilePhotoUrl && !profilePhotoUrl.includes('googleusercontent.com'))
      ? [{
          source: profilePhotoUrl,
          options: { type: 'limbo' } // Use 'limbo' for your real, hosted files
        }]
      : [] // Start empty if it's a Google URL or null
  );
  const handleFilePondUpdate = (fileItems: any[]) => {
    console.log(`[LOG A] 'onupdatefiles' triggered. File count: ${fileItems.length}`);
    if (fileItems.length > 0) {
      console.log('[LOG B] New file added:', fileItems[0].file.name);
    }
    setFiles(fileItems);
  };
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    // --- Application Details ---
    academic_year: '2025-2026',
    semester: '1st',
    assistance_type: 'Scholarship',
    is_priority_course: false,
    
    // --- Personal Info ---
    family_name: auth.user?.name.split(' ').pop() ?? '',
    given_name: auth.user?.name.split(' ').slice(0, -1).join(' ') ?? '',
    middle_name: '',
    extension_name: '',
    street: '',
    barangay: '',
    city_municipality: '',
    province: '',
    district: '',
    zip_code: '',
    sex: '',
    civil_status: '',
    birth_date: '',
    birth_place: '',
    citizenship: 'Filipino',
    mobile_no: '',
    email_address: auth.user?.email ?? '',
    disability: 'N/A',
    is_indigenous: false,
    indigenous_group: '',

    // --- Family Background ---
    father_name: '',
    father_status: 'Living',
    father_address: '',
    father_occupation: 'N/A',
    father_education: 'N/A',
    mother_name: '',
    mother_status: 'Living',
    mother_address: '',
    mother_occupation: 'N/A',
    mother_education: 'N/A',
    siblings_count: 0,
    family_income: 0,
    is_4ps_beneficiary: false,

    // --- Academic Info ---
    last_school_name: '',
    last_school_address: '',
    last_school_type: 'Public',
    school_level: '',
    course: '',
    year_level: '',
    gwa: 0,

    // --- Consent ---
    consent: false,
  });

  const requiredFieldsStep1 = [
    'academic_year', 'semester', 'family_name', 'given_name', 'middle_name', 'barangay',
    'city_municipality', 'province', 'sex', 'civil_status', 'birth_date', 'birth_place',
    'citizenship', 'mobile_no'
  ] as const;

  const requiredFieldsStep2 = [
    'father_name', 'father_status', 'father_address',
    'mother_name', 'mother_status', 'mother_address'
  ] as const;

  const requiredFieldsStep3 = [
    'family_income', 'siblings_count', 'last_school_name', 'last_school_address',
    'school_level', 'gwa'
  ] as const;

  const validateStep = (step: number) => {
    clearErrors();
    let isValid = true;
    let fields: readonly (keyof typeof data)[] = [];

    if (step === 1) {
      fields = requiredFieldsStep1;
      if (data.is_indigenous && !data.indigenous_group) {
        setError('indigenous_group', 'Required if indigenous.');
        isValid = false;
      }
    } else if (step === 2) {
      fields = requiredFieldsStep2;
    } else if (step === 3) {
      fields = requiredFieldsStep3;
      if (data.school_level === 'College') {
        if (!data.course) {
          setError('course', 'Required for college level.');
          isValid = false;
        }
        if (!data.year_level) {
          setError('year_level', 'Required for college level.');
          isValid = false;
        }
      }
      if (data.family_income <= 0) {
        setError('family_income', 'Must be greater than 0.');
        isValid = false;
      }
      if (data.gwa <= 0) {
        setError('gwa', 'Must be greater than 0.');
        isValid = false;
      }
    }

    fields.forEach(field => {
      if (!data[field] || data[field] === 'N/A') {
        setError(field, 'This field is required and cannot be N/A unless specified.');
        isValid = false;
      }
    });

    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please fill out all required fields correctly. N/A is allowed only for optional fields like disability, occupations, etc.');
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!data.consent) {
      toast.error("You must agree to the Data Privacy Notice to continue.");
      return;
    }
    if (!validateStep(3)) {
      toast.error("Please review the form. Some required fields in Step 3 are missing.");
      return;
    }
    post(route('scholar.csmp-scholars.store'), {
      onSuccess: () => toast.success('Application Submitted Successfully!'),
      onError: (errorResponse) => {
        console.log("Validation Errors:", errorResponse);
        setCurrentStep(1);
        toast.error("Please review the form. Some required fields are missing.");
      }
    });
  };

  return (
    <AuthenticatedLayout user={auth.user} page_title="Scholarship Application">
      <Head title="CHED Merit Scholarship Program (CMSP) Application Form" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 my-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <header className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
            <div className="grid grid-cols-3 items-center">
              <div className="flex justify-start">
                <img src="/images/Logo.svg" alt="CHED Logo" className="w-24 h-24" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">Office of the President of the Philippines</h2>
                <h2 className="text-xl font-bold text-white">COMMISSION ON HIGHER EDUCATION</h2>
                <h2 className="text-xl font-bold text-white">REGIONAL OFFICE __</h2>
                <h1 className="text-3xl font-bold text-white mt-2">CHED MERIT SCHOLARSHIP PROGRAM (CMSP)</h1>
                <h1 className="text-3xl font-bold text-white">APPLICATION FORM</h1>
              </div>
              <div className="flex justify-end">
                {/* Empty for balance */}
              </div>
            </div>
            <p className="mt-4 text-sm text-indigo-100 text-center">
              Instructions: Read General and Documentary Requirements. Fill in all the required information. Do not leave an item blank. If item is not applicable, indicate "N/A".
            </p>
          </header>

          {/* --- Step Indicator with Animation --- */}
          <div className="relative flex justify-around p-6 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 z-0">
              <div className="h-full bg-indigo-600 transition-all duration-500 ease-in-out"style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
            </div>
            <StepTab num={1} title="Personal" active={currentStep === 1} />
            <StepTab num={2} title="Family" active={currentStep === 2} />
            <StepTab num={3} title="Academic & Financial" active={currentStep === 3} />
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* --- STEP 1: PERSONAL INFORMATION --- */}
            {currentStep === 1 && (
              <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <span className="mr-2">📋</span> Part I: Personal Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* --- Application Details --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel htmlFor="academic_year" value="Academic Year" />
                        <SelectInput
                          id="academic_year"
                          className="mt-1 block w-full"
                          value={data.academic_year}
                          onChange={(e: any) => setData('academic_year', e.target.value)}
                        >
                          <option>2025-2026</option>
                          <option>2024-2025</option>
                        </SelectInput>
                        <InputError message={errors.academic_year} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="semester" value="Semester" />
                        <SelectInput
                          id="semester"
                          className="mt-1 block w-full"
                          value={data.semester}
                          onChange={(e: any) => setData('semester', e.target.value)}
                        >
                          <option>1st</option>
                          <option>2nd</option>
                        </SelectInput>
                        <InputError message={errors.semester} className="mt-2" />
                      </div>
                    </div>

                    {/* --- Name --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2">
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="family_name" value="Family Name" />
                        <TextInput id="family_name" value={data.family_name} onChange={(e: any) => setData('family_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.family_name} className="mt-2" />
                      </div>
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="given_name" value="Given Name" />
                        <TextInput id="given_name" value={data.given_name} onChange={(e: any) => setData('given_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.given_name} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="middle_name" value="Middle Name" />
                        <TextInput id="middle_name" value={data.middle_name} onChange={(e: any) => setData('middle_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.middle_name} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="extension_name" value="Extension (Jr, Sr)" />
                        <TextInput id="extension_name" value={data.extension_name} onChange={(e: any) => setData('extension_name', e.target.value)} className="mt-1 block w-full" />
                      </div>
                    </div>

                    {/* --- Address --- */}
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 pt-4 flex items-center">
                      <span className="mr-2">🏠</span> Permanent Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="street" value="Street" />
                        <TextInput id="street" value={data.street} onChange={(e: any) => setData('street', e.target.value)} className="mt-1 block w-full" />
                      </div>
                      <div>
                        <InputLabel htmlFor="barangay" value="Barangay" />
                        <TextInput id="barangay" value={data.barangay} onChange={(e: any) => setData('barangay', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.barangay} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="city_municipality" value="City/Municipality" />
                        <TextInput id="city_municipality" value={data.city_municipality} onChange={(e: any) => setData('city_municipality', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.city_municipality} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="province" value="Province" />
                        <TextInput id="province" value={data.province} onChange={(e: any) => setData('province', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.province} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="district" value="District" />
                        <TextInput id="district" value={data.district} onChange={(e: any) => setData('district', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.district} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="zip_code" value="Zip Code" />
                        <TextInput id="zip_code" value={data.zip_code} onChange={(e: any) => setData('zip_code', e.target.value)} className="mt-1 block w-full" />
                      </div>
                    </div>

                    {/* --- Personal Details --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div>
                        <InputLabel htmlFor="sex" value="Sex" />
                        <SelectInput id="sex" className="mt-1 block w-full" value={data.sex} onChange={(e: any) => setData('sex', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </SelectInput>
                        <InputError message={errors.sex} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="civil_status" value="Civil Status" />
                        <SelectInput id="civil_status" className="mt-1 block w-full" value={data.civil_status} onChange={(e: any) => setData('civil_status', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                        </SelectInput>
                        <InputError message={errors.civil_status} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="birth_date" value="Birth Date" />
                        <TextInput id="birth_date" type="date" value={data.birth_date} onChange={(e: any) => setData('birth_date', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.birth_date} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="birth_place" value="Birth Place" />
                        <TextInput id="birth_place" value={data.birth_place} onChange={(e: any) => setData('birth_place', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.birth_place} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="citizenship" value="Citizenship" />
                        <TextInput id="citizenship" value={data.citizenship} onChange={(e: any) => setData('citizenship', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.citizenship} className="mt-2" />
                      </div>
                    </div>

                    {/* --- Contact Details --- */}
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 pt-4 flex items-center">
                      <span className="mr-2">📞</span> Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel htmlFor="mobile_no" value="Mobile Number" />
                        <TextInput id="mobile_no" value={data.mobile_no} onChange={(e: any) => setData('mobile_no', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.mobile_no} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="email_address" value="Email Address (read-only)" />
                        <TextInput id="email_address" type="email" value={data.email_address} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700" readOnly />
                      </div>
                    </div>

                    {/* --- Disability/Indigenous --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <InputLabel htmlFor="disability" value="Disability (if any, else N/A)" />
                        <TextInput id="disability" value={data.disability} onChange={(e: any) => setData('disability', e.target.value)} className="mt-1 block w-full" />
                      </div>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="is_indigenous" checked={data.is_indigenous} onChange={(e: any) => setData('is_indigenous', e.target.checked)} />
                          <InputLabel htmlFor="is_indigenous" value="Member of Indigenous Group?" />
                        </div>
                        {data.is_indigenous && (
                          <div className="flex-1">
                            <InputLabel htmlFor="indigenous_group" value="If yes, specify:" />
                            <TextInput id="indigenous_group" value={data.indigenous_group} onChange={(e: any) => setData('indigenous_group', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.indigenous_group} className="mt-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
        <div className="lg:col-span-1">
                  <div className="sticky top-4">

                    {/* This container's ONLY job is to set the size.
                      No 'rounded-full' or 'overflow-hidden'.
                    */}
                    <div className="w-48 h-48 mx-auto">
                      <FilePond
                        files={files}
                        onupdatefiles={handleFilePondUpdate} // Your log handler
                        oninit={() => console.log('FilePond instance has initialized!')}
                        
                        // --- Core Logic ---
                        allowMultiple={false}
                        maxFiles={1}
                        allowReplace={true} 
                        acceptedFileTypes={['image/*']}
                        name="photo"

                        // --- The Fix ---
                        // This prop tells FilePond to be a circle.
                        stylePanelLayout="circle" 
                        
                        // --- Optional Styling ---
                        imageCropAspectRatio="1:1"
                        imagePreviewHeight={176} 
                        styleButtonRemoveItemPosition="center bottom"
                        labelIdle='Upload 2x2 Photo<br/><span class="filepond--label-action">Browse</span>'

                        // --- Server Logic (Unchanged) ---
                        server={{
                          process: (fieldName, file, metadata, load, error, progress, abort) => {
                            console.log('[LOG 1] FilePond "process" function has been triggered!');
                            try {
                              const formData = new FormData();
                              formData.append(fieldName, file);
                              const postRoute = route('scholar.profile.photo.update'); 
                              console.log('[LOG 2] FormData created. Calling router.post...', postRoute);
                              router.post(postRoute, formData, {
                                forceFormData: true,
onProgress: (event) => progress(event?.lengthComputable ?? false, event?.loaded ?? 0, event?.total ?? 0),
                                onSuccess: (response: any) => {
                                  console.log('[LOG 4] Upload success:', response);
                                  load(response.path); 
                                },
                                onError: (err) => {
                                  console.error('[LOG 5] Upload failed (onError):', err);
                                  error('Upload failed');
                                },
                              });
                            } catch (e) {
                              console.error('[LOG 6] CRITICAL ERROR in FilePond process:', e);
                              error('A critical error occurred.');
                            }
                            return { abort };
                          },
                          revert: (uniqueFileId, load, error) => {
                            console.log('[LOG 7] Revert function triggered for:', uniqueFileId);
                            router.delete(route('scholar.profile.photo.revert'), {
                              data: uniqueFileId,
                              headers: { 'Content-Type': 'application/json' },
                              onSuccess: () => {
                                console.log('[LOG 8] Revert success.');
                                load(); 
                              },
                              onError: (err) => {
                                console.error('[LOG 9] Revert failed:', err);
                                error('Revert failed');
                              },
                            });
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* --- STEP 2: FAMILY BACKGROUND --- */}
            {currentStep === 2 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <span className="mr-2">👨‍👩‍👧‍👦</span> Part II: Family Background
                </h2>
                
                <div className="space-y-8">
                  {/* --- Father --- */}
                  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                    <legend className="px-2 font-medium text-gray-700 dark:text-gray-300">Father's Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <InputLabel htmlFor="father_name" value="Full Name" />
                        <TextInput id="father_name" value={data.father_name} onChange={(e: any) => setData('father_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.father_name} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="father_status" value="Status" />
                        <SelectInput id="father_status" className="mt-1 block w-full" value={data.father_status} onChange={(e: any) => setData('father_status', e.target.value)}>
                          <option>Living</option>
                          <option>Deceased</option>
                        </SelectInput>
                      </div>
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="father_address" value="Address" />
                        <TextInput id="father_address" value={data.father_address} onChange={(e: any) => setData('father_address', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.father_address} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="father_occupation" value="Occupation (N/A if none)" />
                        <TextInput id="father_occupation" value={data.father_occupation} onChange={(e: any) => setData('father_occupation', e.target.value)} className="mt-1 block w-full" />
                      </div>
                      <div>
                        <InputLabel htmlFor="father_education" value="Educational Attainment (N/A if none)" />
                        <TextInput id="father_education" value={data.father_education} onChange={(e: any) => setData('father_education', e.target.value)} className="mt-1 block w-full" />
                      </div>
                    </div>
                  </fieldset>

                  {/* --- Mother --- */}
                  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                    <legend className="px-2 font-medium text-gray-700 dark:text-gray-300">Mother's Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <InputLabel htmlFor="mother_name" value="Full Name" />
                        <TextInput id="mother_name" value={data.mother_name} onChange={(e: any) => setData('mother_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.mother_name} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="mother_status" value="Status" />
                        <SelectInput id="mother_status" className="mt-1 block w-full" value={data.mother_status} onChange={(e: any) => setData('mother_status', e.target.value)}>
                          <option>Living</option>
                          <option>Deceased</option>
                        </SelectInput>
                      </div>
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="mother_address" value="Address" />
                        <TextInput id="mother_address" value={data.mother_address} onChange={(e: any) => setData('mother_address', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.mother_address} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="mother_occupation" value="Occupation (N/A if none)" />
                        <TextInput id="mother_occupation" value={data.mother_occupation} onChange={(e: any) => setData('mother_occupation', e.target.value)} className="mt-1 block w-full" />
                      </div>
                      <div>
                        <InputLabel htmlFor="mother_education" value="Educational Attainment (N/A if none)" />
                        <TextInput id="mother_education" value={data.mother_education} onChange={(e: any) => setData('mother_education', e.target.value)} className="mt-1 block w-full" />
                      </div>
                    </div>
                  </fieldset>
                </div>
              </section>
            )}

            {/* --- STEP 3: ACADEMIC & FINANCIAL --- */}
            {currentStep === 3 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <span className="mr-2">🎓</span> Part III: Financial & Academic Info
                </h2>
                
                <div className="space-y-8">
                  {/* --- Financial --- */}
                  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                    <legend className="px-2 font-medium text-gray-700 dark:text-gray-300">Financial Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <InputLabel htmlFor="family_income" value="Total Gross Annual Family Income" />
                        <TextInput id="family_income" type="number" step="0.01" value={data.family_income} onChange={(e: any) => setData('family_income', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.family_income} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="siblings_count" value="Number of Siblings" />
                        <TextInput id="siblings_count" type="number" value={data.siblings_count} onChange={(e: any) => setData('siblings_count', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.siblings_count} className="mt-2" />
                      </div>
                      <div className="md:col-span-2 flex items-center space-x-2">
                        <Checkbox id="is_4ps_beneficiary" checked={data.is_4ps_beneficiary} onChange={(e: any) => setData('is_4ps_beneficiary', e.target.checked)} />
                        <InputLabel htmlFor="is_4ps_beneficiary" value="Are you a 4P's Beneficiary?" />
                        <InputError message={errors.is_4ps_beneficiary} className="mt-2" />
                      </div>
                    </div>
                  </fieldset>

                  {/* --- Academic --- */}
                  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                    <legend className="px-2 font-medium text-gray-700 dark:text-gray-300">Academic Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="last_school_name" value="Last School Attended" />
                        <TextInput id="last_school_name" value={data.last_school_name} onChange={(e: any) => setData('last_school_name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.last_school_name} className="mt-2" />
                      </div>
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="last_school_address" value="School Address" />
                        <TextInput id="last_school_address" value={data.last_school_address} onChange={(e: any) => setData('last_school_address', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.last_school_address} className="mt-2" />
                      </div>
                      <div>
                        <InputLabel htmlFor="last_school_type" value="School Type" />
                        <SelectInput id="last_school_type" className="mt-1 block w-full" value={data.last_school_type} onChange={(e: any) => setData('last_school_type', e.target.value)}>
                          <option>Public</option>
                          <option>Private</option>
                        </SelectInput>
                      </div>
                      <div>
                        <InputLabel htmlFor="school_level" value="Last School Level Attended" />
                        <SelectInput id="school_level" className="mt-1 block w-full" value={data.school_level} onChange={(e: any) => setData('school_level', e.target.value)}>
                          <option value="">Select...</option>
                          <option>High School</option>
                          <option>Senior High School</option>
                          <option>College</option>
                        </SelectInput>
                        <InputError message={errors.school_level} className="mt-2" />
                      </div>
                      
                      {/* --- Conditional College Fields --- */}
                      {data.school_level === 'College' && (
                        <>
                          <div>
                            <InputLabel htmlFor="course" value="Course" />
                            <TextInput id="course" value={data.course} onChange={(e: any) => setData('course', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.course} className="mt-2" />
                          </div>
                          <div>
                            <InputLabel htmlFor="year_level" value="Year Level" />
                            <TextInput id="year_level" value={data.year_level} onChange={(e: any) => setData('year_level', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.year_level} className="mt-2" />
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2">
                        <InputLabel htmlFor="gwa" value="General Weighted Average (GWA) from last level" />
                        <TextInput id="gwa" type="number" step="0.01" value={data.gwa} onChange={(e: any) => setData('gwa', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.gwa} className="mt-2" />
                      </div>
                    </div>
                  </fieldset>

                  {/* --- Data Privacy Consent --- */}
                  <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-sm">
                    <legend className="px-2 font-medium text-gray-700 dark:text-gray-300">Data Privacy Notice</legend>
                    <div className="p-4 prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <p>
                        In compliance with the Data Privacy Act (R.A. 10173), I hereby consent to the collection, processing, and storage of my personal and sensitive personal data submitted in this application form.
                      </p>
                      <p>
                        I understand that this information will be used by the scholarship committee for the purposes of evaluation, selection, and documentation for the CSMP scholarship.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox id="consent" checked={data.consent} onChange={(e: any) => setData('consent', e.target.checked)} />
                      <InputLabel htmlFor="consent" value="I have read and agree to the Data Privacy Notice." />
                    </div>
                    <InputError message={errors.consent} className="mt-2" />
                  </fieldset>
                </div>
              </section>
            )}

            {/* --- NAVIGATION BUTTONS --- */}
            <footer className="flex justify-between items-center pt-8 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || processing}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!data.consent || processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                  {processing ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </footer>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </AuthenticatedLayout>
  );
}

// --- Helper component for Step Indicator ---
const StepTab = ({ num, title, active }: { num: number, title: string, active: boolean }) => (
  <div className="flex flex-col items-center relative z-10 transition-all duration-500 ease-in-out">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-md transform ${active ? 'scale-110' : 'scale-100'}
        ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
      `}
    >
      {num}
    </div>
    <span className={`mt-2 text-sm font-medium ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {title}
    </span>
  </div>
);
