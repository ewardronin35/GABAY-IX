import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { FormEventHandler } from 'react';
import { route } from 'ziggy-js';
import { Download, Send } from 'lucide-react';
import ExcelJS from 'exceljs';

const LEAVE_TYPES = [
    { value: 'vacation', label: 'Vacation Leave', row: 11 },
    { value: 'mandatory', label: 'Mandatory/Forced Leave', row: 13 },
    { value: 'sick', label: 'Sick Leave', row: 15 },
    { value: 'maternity', label: 'Maternity Leave', row: 17 },
    { value: 'paternity', label: 'Paternity Leave', row: 19 },
    { value: 'special_privilege', label: 'Special Privilege Leave', row: 21 },
    { value: 'solo_parent', label: 'Solo Parent Leave', row: 23 },
    { value: 'study', label: 'Study Leave', row: 25 },
    { value: 'vawc', label: '10-Day VAWC Leave', row: 27 },
    { value: 'rehabilitation', label: 'Rehabilitation Privilege', row: 29 },
    { value: 'special_women', label: 'Special Leave Benefits for Women', row: 31 },
    { value: 'calamity', label: 'Special Emergency (Calamity) Leave', row: 33 },
    { value: 'adoption', label: 'Adoption Leave', row: 35 },
    { value: 'others', label: 'Others', row: 39 },
];

export default function LeaveForm({ auth }: PageProps) {
 const user = auth.user;
    const { data, setData, post, processing, errors, reset } = useForm({
        office_department: 'CHED Regional Office IX',
        last_name: auth.user?.name?.split(' ').slice(-1)[0] || '',
        first_name: auth.user?.name?.split(' ').slice(0, -1).join(' ') || '',
        middle_name: '',
        date_of_filing: new Date().toISOString().split('T')[0],
        position: '',
        salary: '',
        leave_type: '',
        leave_type_others: '',
        // Details fields
        vacation_location_ph: '',
        vacation_location_abroad: '',
        sick_in_hospital: '',
        sick_out_patient: '',
        special_women_illness: '',
        study_masters: false,
        study_bar: false,
        study_other: '',
        monetization: false,
        terminal_leave: false,
        // Dates
        working_days: '',
        inclusive_date_start: '',
        inclusive_date_end: '',
        commutation_requested: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        console.log('Form data being submitted:', data);

        post(route('leave-form.store'), {
            onSuccess: () => {
                console.log('Form submitted successfully!');
                reset();
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
            onFinish: () => {
                console.log('Form submission finished');
            },
        });
    };

    const handleExport = async () => {
        try {
            // Fetch the template
            const response = await fetch('/templates/LEAVE_FORM_CS_Form_No_6_Revised_2020.xlsx');
            
            if (!response.ok) {
                alert(`Failed to fetch template: ${response.status} ${response.statusText}. Make sure the file exists at public/templates/`);
                return;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            
            // Get worksheet by name or fallback to first
            let worksheet = workbook.getWorksheet('CS Form No. 6, Rev 2020 1 of 2');
            if (!worksheet) {
                worksheet = workbook.worksheets[0];
            }
            if (!worksheet) {
                alert('Could not load template worksheet');
                return;
            }

            // Fill in the form data
            // Row 5: Office/Department and Name
            worksheet.getCell('B5').value = data.office_department;
            worksheet.getCell('E5').value = `${data.last_name}                    ${data.first_name}                    ${data.middle_name}`;
            
            // Row 6: Date of Filing, Position, Salary
            worksheet.getCell('A6').value = `3.   DATE OF FILING  ${data.date_of_filing}                         `;
            worksheet.getCell('E6').value = `4.   POSITION  ${data.position}     5.  SALARY  ${data.salary}`;

            // Mark the selected leave type with a checkbox character
            const selectedLeave = LEAVE_TYPES.find(t => t.value === data.leave_type);
            if (selectedLeave) {
                worksheet.getCell(`B${selectedLeave.row}`).value = '☑';
            }

            // If others, fill in the others field
            if (data.leave_type === 'others' && data.leave_type_others) {
                worksheet.getCell('B41').value = data.leave_type_others;
            }

            // Fill leave details based on type
            if (data.leave_type === 'vacation' || data.leave_type === 'special_privilege') {
                if (data.vacation_location_ph) {
                    worksheet.getCell('I13').value = `Within the Philippines ${data.vacation_location_ph}`;
                }
                if (data.vacation_location_abroad) {
                    worksheet.getCell('I15').value = `Abroad (Specify) ${data.vacation_location_abroad}`;
                }
            }

            if (data.leave_type === 'sick') {
                if (data.sick_in_hospital) {
                    worksheet.getCell('I19').value = `In Hospital (Specify Illness) ${data.sick_in_hospital}`;
                }
                if (data.sick_out_patient) {
                    worksheet.getCell('I21').value = `Out Patient (Specify Illness) ${data.sick_out_patient}`;
                }
            }

            if (data.leave_type === 'special_women' && data.special_women_illness) {
                worksheet.getCell('H27').value = `(Specify Illness) ${data.special_women_illness}`;
            }

            if (data.leave_type === 'study') {
                if (data.study_masters) {
                    worksheet.getCell('H33').value = "☑ Completion of Master's Degree";
                }
                if (data.study_bar) {
                    worksheet.getCell('I35').value = '☑ BAR/Board Examination Review';
                }
                if (data.study_other) {
                    worksheet.getCell('H37').value = `Other purpose: ${data.study_other}`;
                }
            }

            if (data.monetization) {
                worksheet.getCell('H39').value = '☑ Monetization of Leave Credits';
            }
            if (data.terminal_leave) {
                worksheet.getCell('I41').value = '☑ Terminal Leave';
            }

            // 6.C - Working days and inclusive dates
            worksheet.getCell('B45').value = data.working_days;
            if (data.inclusive_date_start && data.inclusive_date_end) {
                worksheet.getCell('B48').value = `${data.inclusive_date_start} to ${data.inclusive_date_end}`;
            }

            // 6.D - Commutation
            if (data.commutation_requested) {
                worksheet.getCell('H45').value = 'Not Requested';
                worksheet.getCell('H47').value = '☑ Requested';
            } else {
                worksheet.getCell('H45').value = '☑ Not Requested';
                worksheet.getCell('H47').value = 'Requested';
            }

            // Generate and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Leave_Application_${data.last_name}_${data.date_of_filing}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export. Make sure the template file exists at /public/templates/LEAVE_FORM_CS_Form_No_6_Revised_2020.xlsx');
        }
    };

    const showVacationDetails = ['vacation', 'special_privilege'].includes(data.leave_type);
    const showSickDetails = data.leave_type === 'sick';
    const showWomenDetails = data.leave_type === 'special_women';
    const showStudyDetails = data.leave_type === 'study';

    return (
       
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Civil Service Form No. 6, Revised 2020</p>
                                <CardTitle className="text-2xl mt-2">APPLICATION FOR LEAVE</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Display validation errors */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                                        <ul className="list-disc list-inside text-sm text-red-600">
                                            {Object.entries(errors).map(([key, value]) => (
                                                <li key={key}>{value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Section 1-5: Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>1. Office/Department</Label>
                                        <Input
                                            value={data.office_department}
                                            onChange={(e) => setData('office_department', e.target.value)}
                                        />
                                        <InputError message={errors.office_department} />
                                    </div>
                                    <div>
                                        <Label>3. Date of Filing</Label>
                                        <Input
                                            type="date"
                                            value={data.date_of_filing}
                                            onChange={(e) => setData('date_of_filing', e.target.value)}
                                        />
                                        <InputError message={errors.date_of_filing} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>2. Last Name</Label>
                                        <Input
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                    <div>
                                        <Label>First Name</Label>
                                        <Input
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>
                                    <div>
                                        <Label>Middle Name</Label>
                                        <Input
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                        />
                                        <InputError message={errors.middle_name} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>4. Position</Label>
                                        <Input
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                        />
                                        <InputError message={errors.position} />
                                    </div>
                                    <div>
                                        <Label>5. Salary</Label>
                                        <Input
                                            type="number"
                                            value={data.salary}
                                            onChange={(e) => setData('salary', e.target.value)}
                                        />
                                        <InputError message={errors.salary} />
                                    </div>
                                </div>

                                {/* Section 6: Details of Application */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-lg mb-4">6. DETAILS OF APPLICATION</h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* 6.A - Type of Leave */}
                                        <div>
                                            <Label className="font-semibold">6.A TYPE OF LEAVE TO BE AVAILED OF</Label>
                                            <Select
                                                value={data.leave_type}
                                                onValueChange={(value) => setData('leave_type', value)}
                                            >
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue placeholder="Select leave type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LEAVE_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.leave_type} />

                                            {data.leave_type === 'others' && (
                                                <div className="mt-2">
                                                    <Input
                                                        placeholder="Specify leave type"
                                                        value={data.leave_type_others}
                                                        onChange={(e) => setData('leave_type_others', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* 6.B - Details of Leave */}
                                        <div>
                                            <Label className="font-semibold">6.B DETAILS OF LEAVE</Label>

                                            {showVacationDetails && (
                                                <div className="mt-2 space-y-2">
                                                    <div>
                                                        <Label className="text-sm">Within the Philippines</Label>
                                                        <Input
                                                            value={data.vacation_location_ph}
                                                            onChange={(e) => setData('vacation_location_ph', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm">Abroad (Specify)</Label>
                                                        <Input
                                                            value={data.vacation_location_abroad}
                                                            onChange={(e) => setData('vacation_location_abroad', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {showSickDetails && (
                                                <div className="mt-2 space-y-2">
                                                    <div>
                                                        <Label className="text-sm">In Hospital (Specify Illness)</Label>
                                                        <Input
                                                            value={data.sick_in_hospital}
                                                            onChange={(e) => setData('sick_in_hospital', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm">Out Patient (Specify Illness)</Label>
                                                        <Input
                                                            value={data.sick_out_patient}
                                                            onChange={(e) => setData('sick_out_patient', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {showWomenDetails && (
                                                <div className="mt-2">
                                                    <Label className="text-sm">Specify Illness</Label>
                                                    <Input
                                                        value={data.special_women_illness}
                                                        onChange={(e) => setData('special_women_illness', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {showStudyDetails && (
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="study_masters"
                                                            checked={data.study_masters}
                                                            onCheckedChange={(checked) => setData('study_masters', !!checked)}
                                                        />
                                                        <Label htmlFor="study_masters" className="text-sm font-normal">
                                                            Completion of Master's Degree
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="study_bar"
                                                            checked={data.study_bar}
                                                            onCheckedChange={(checked) => setData('study_bar', !!checked)}
                                                        />
                                                        <Label htmlFor="study_bar" className="text-sm font-normal">
                                                            BAR/Board Examination Review
                                                        </Label>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm">Other Purpose</Label>
                                                        <Input
                                                            value={data.study_other}
                                                            onChange={(e) => setData('study_other', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!showVacationDetails && !showSickDetails && !showWomenDetails && !showStudyDetails && (
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="monetization"
                                                            checked={data.monetization}
                                                            onCheckedChange={(checked) => setData('monetization', !!checked)}
                                                        />
                                                        <Label htmlFor="monetization" className="text-sm font-normal">
                                                            Monetization of Leave Credits
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="terminal_leave"
                                                            checked={data.terminal_leave}
                                                            onCheckedChange={(checked) => setData('terminal_leave', !!checked)}
                                                        />
                                                        <Label htmlFor="terminal_leave" className="text-sm font-normal">
                                                            Terminal Leave
                                                        </Label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 6.C & 6.D */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <Label className="font-semibold">6.C NUMBER OF WORKING DAYS APPLIED FOR</Label>
                                            <Input
                                                type="number"
                                                className="mt-2"
                                                value={data.working_days}
                                                onChange={(e) => setData('working_days', e.target.value)}
                                            />
                                            <InputError message={errors.working_days} />

                                            <Label className="mt-4 block">INCLUSIVE DATES</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div>
                                                    <Label className="text-sm">From</Label>
                                                    <Input
                                                        type="date"
                                                        value={data.inclusive_date_start}
                                                        onChange={(e) => setData('inclusive_date_start', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm">To</Label>
                                                    <Input
                                                        type="date"
                                                        value={data.inclusive_date_end}
                                                        onChange={(e) => setData('inclusive_date_end', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="font-semibold">6.D COMMUTATION</Label>
                                            <RadioGroup
                                                className="mt-2"
                                                value={data.commutation_requested ? 'requested' : 'not_requested'}
                                                onValueChange={(value) => setData('commutation_requested', value === 'requested')}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="not_requested" id="not_requested" />
                                                    <Label htmlFor="not_requested" className="font-normal">Not Requested</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="requested" id="requested" />
                                                    <Label htmlFor="requested" className="font-normal">Requested</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={handleExport}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export to Excel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
    );
}
