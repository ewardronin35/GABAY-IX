import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper component for a custom checkbox that looks like the document
const FormCheckbox = ({ label, checked, onChange }) => (
    <div className="flex items-start mb-1 cursor-pointer group" onClick={onChange}>
        <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white group-hover:bg-gray-100'}`}>
             {/* Simulating the solid square in the image */}
             {checked && <div className="w-2 h-2 bg-white" />} 
        </div>
        <span className="text-sm leading-tight text-black">{label}</span>
    </div>
);

const TravelReportForm = ({ itineraryData, appendixBData, user, initialData, onDataChange }) => {
    
    // 1. Initialize with initialData OR defaults
    const [formData, setFormData] = useState({
        title_of_travel: initialData?.title_of_travel || '',
        venue: initialData?.venue || '',
        type_training: initialData?.type_training || false,
        type_meeting: initialData?.type_meeting || false,
        type_monitoring: initialData?.type_monitoring || false,
        type_others: initialData?.type_others || false,
        type_others_specify: initialData?.type_others_specify || '',
        role_speaker: initialData?.role_speaker || false,
        role_participant: initialData?.role_participant !== undefined ? initialData.role_participant : true,
        role_organizer: initialData?.role_organizer || false,
        role_evaluator: initialData?.role_evaluator || false,
        report_body: initialData?.report_body || `I undertook official travel to attend activities and coordination meetings related to CHED operations. The purpose of this travel was to participate in scheduled discussions, provide support to partner institutions, and carry out tasks aligned with the mandate of the office.\n\nDuring the travel period, I performed duties that involved coordination with relevant agencies, participation in meetings, and facilitation of necessary administrative and programmatic requirements. These engagements contributed to the continuous improvement of operations and ensured that ongoing initiatives were properly monitored and supported.\n\nLogistical arrangements such as accommodations and meals were managed by the host office/agency, allowing participants to fully focus on the scheduled work activities. Transportation and related expenses were processed in accordance with existing government guidelines.\n\nOverall, the travel successfully met its intended objectives and strengthened inter-agency coordination, contributing to smoother implementation of current and future programs.`,
        prepared_by: initialData?.prepared_by || user?.name || '',
        position: initialData?.position || '' 
    });

    const [date, setDate] = useState(initialData?.date_conducted ? new Date(initialData.date_conducted) : null);
    const reportRef = useRef();

    // 2. Auto-fill logic (Only runs if fields are empty to avoid overwriting user input)
    useEffect(() => {
        setFormData(prev => {
            const updates = { ...prev };
            let changed = false;

            if (!prev.title_of_travel && appendixBData?.purpose) {
                updates.title_of_travel = appendixBData.purpose;
                changed = true;
            }
            if (!prev.venue && itineraryData?.place_visited) {
                updates.venue = itineraryData.place_visited;
                changed = true;
            }
            if (!prev.prepared_by && user?.name) {
                updates.prepared_by = user.name;
                changed = true;
            }

            return changed ? updates : prev;
        });

        if (!date && appendixBData?.travel_dates) {
            const possibleDate = new Date(appendixBData.travel_dates);
            if (!isNaN(possibleDate)) setDate(possibleDate);
        }
    }, [itineraryData, appendixBData, user]);

    // 3. Sync to Parent (CreateTravelClaims)
    useEffect(() => {
        if (onDataChange) {
            onDataChange({
                ...formData,
                date_conducted: date ? format(date, "yyyy-MM-dd") : ''
            });
        }
    }, [formData, date  ]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleExportToPdf = async () => {
        const input = reportRef.current;
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Form-TR-01-Travel-Report.pdf');
    };

    return (
        <div className="flex flex-col items-center gap-6 py-8 bg-gray-100 dark:bg-zinc-950 min-h-screen transition-colors duration-300">
            {/* Toolbar */}
            <div className="flex gap-4 w-full max-w-[210mm] justify-end">
                <Button onClick={handleExportToPdf} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>

            {/* THE PAPER (A4 Dimension Simulation) */}
            {/* Strict text-black to override dark mode defaults inside the paper */}
            <div 
                ref={reportRef}
                className="bg-white shadow-xl w-[210mm] min-h-[297mm] p-[15mm] text-black text-sm relative"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                {/* --- HEADER SECTION --- */}
                <div className="flex justify-between items-center mb-6">
                    {/* Placeholder for CHED Logo */}
                    <div className="w-20 h-20 flex items-center justify-center">
                         <img src="/images/ched-logo.png" alt="CHED" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'}/>
                    </div>

                    <div className="text-center font-serif text-black">
                        <h1 className="text-lg font-bold uppercase tracking-wide">Commission on Higher Education</h1>
                        <h2 className="text-xl font-bold uppercase">Regional Office IX</h2>
                    </div>

                    {/* Placeholder for Bagong Pilipinas Logo */}
                    <div className="w-20 h-20 flex items-center justify-center">
                        <img src="/images/bagong-pilipinas-logo.png" alt="BP" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'}/>
                    </div>
                </div>

                <div className="text-right mb-4 text-black">
                    <span className="font-bold text-sm">Form TR-01</span>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-lg font-bold uppercase text-blue-900">Travel Report</h2>
                </div>

                {/* --- FORM FIELDS SECTION --- */}
                <div className="space-y-4 mb-8 text-black">
                    {/* Title of Travel */}
                    <div className="flex">
                        <div className="w-32 font-semibold">Title of Travel</div>
                        <div className="mx-2">:</div>
                        <div className="flex-1">
                            <textarea 
                                className="w-full resize-none overflow-hidden outline-none bg-transparent font-bold text-black placeholder:text-gray-400"
                                rows={2}
                                value={formData.title_of_travel}
                                placeholder="Enter Title Here..."
                                onChange={(e) => handleChange('title_of_travel', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Venue */}
                    <div className="flex">
                        <div className="w-32 font-semibold">Venue</div>
                        <div className="mx-2">:</div>
                        <div className="flex-1">
                            <input 
                                className="w-full outline-none bg-transparent font-bold text-black placeholder:text-gray-400"
                                value={formData.venue}
                                placeholder="Enter Venue..."
                                onChange={(e) => handleChange('venue', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type of Travel */}
                    <div className="flex">
                        <div className="w-32 font-semibold pt-1">Type of Travel</div>
                        <div className="mx-2 pt-1">:</div>
                        <div className="flex-1 grid grid-cols-2 gap-x-4">
                            <FormCheckbox 
                                label="Training/Workshop/Orientation/Seminar" 
                                checked={formData.type_training} 
                                onChange={() => handleChange('type_training', !formData.type_training)} 
                            />
                            <FormCheckbox 
                                label="Monitoring" 
                                checked={formData.type_monitoring} 
                                onChange={() => handleChange('type_monitoring', !formData.type_monitoring)} 
                            />
                            <FormCheckbox 
                                label="Meeting" 
                                checked={formData.type_meeting} 
                                onChange={() => handleChange('type_meeting', !formData.type_meeting)} 
                            />
                            <div className="flex items-center">
                                <FormCheckbox 
                                    label="Others:" 
                                    checked={formData.type_others} 
                                    onChange={() => handleChange('type_others', !formData.type_others)} 
                                />
                                <input 
                                    className="border-b border-black ml-1 w-full outline-none text-xs text-black bg-transparent"
                                    value={formData.type_others_specify}
                                    disabled={!formData.type_others}
                                    onChange={(e) => handleChange('type_others_specify', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex">
                        <div className="w-32 font-semibold pt-1">Role</div>
                        <div className="mx-2 pt-1">:</div>
                        <div className="flex-1 grid grid-cols-2 gap-x-4">
                            <FormCheckbox 
                                label="Keynote Speaker / Guest Speaker" 
                                checked={formData.role_speaker} 
                                onChange={() => handleChange('role_speaker', !formData.role_speaker)} 
                            />
                            <FormCheckbox 
                                label="Participant" 
                                checked={formData.role_participant} 
                                onChange={() => handleChange('role_participant', !formData.role_participant)} 
                            />
                            <FormCheckbox 
                                label="Organizer" 
                                checked={formData.role_organizer} 
                                onChange={() => handleChange('role_organizer', !formData.role_organizer)} 
                            />
                            <FormCheckbox 
                                label="Supervisor/ Evaluator" 
                                checked={formData.role_evaluator} 
                                onChange={() => handleChange('role_evaluator', !formData.role_evaluator)} 
                            />
                        </div>
                    </div>

                    {/* Date Conducted - UPDATED TO DATE PICKER */}
                    <div className="flex items-center">
                        <div className="w-32 font-semibold">Date conducted</div>
                        <div className="mx-2">:</div>
                        <div className="flex-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"ghost"}
                                        className={cn(
                                            "w-full justify-start text-left font-bold text-black bg-transparent hover:bg-gray-100 p-0 h-auto rounded-none",
                                            !date && "text-gray-400 font-normal"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "MMMM d, yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* --- BODY TEXT (The Narrative) --- */}
                <div className="border-t-2 border-black pt-4 mb-8">
                    <textarea 
                        className="w-full h-[400px] resize-none outline-none text-justify leading-relaxed bg-transparent text-black"
                        value={formData.report_body}
                        onChange={(e) => handleChange('report_body', e.target.value)}
                    />
                </div>

                {/* --- FOOTER --- */}
                <div className="mt-8 text-black">
                    <p className="mb-4">Prepared by:</p>
                    <div className="mt-8">
                        {/* NAME - AUTO FILLED FROM USER */}
                        <input 
                            className="font-bold uppercase text-lg w-full outline-none bg-transparent text-blue-900 placeholder:text-gray-300"
                            value={formData.prepared_by}
                            placeholder="NAME OF EMPLOYEE"
                            onChange={(e) => handleChange('prepared_by', e.target.value)}
                        />
                        {/* POSITION - STARTS EMPTY */}
                        <input 
                            className="font-bold text-md w-full outline-none bg-transparent text-blue-900 placeholder:text-gray-300"
                            value={formData.position}
                            placeholder="Enter Position Title"
                            onChange={(e) => handleChange('position', e.target.value)}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TravelReportForm;