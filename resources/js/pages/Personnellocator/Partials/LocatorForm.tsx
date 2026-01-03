import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { FormEventHandler, useEffect, useState, useRef } from 'react';
import { route } from 'ziggy-js';
import { Loader2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';

// Props passed from UserDashboard
export default function LocatorForm({ auth, remainingSeconds, onRedirectToLeave }: any) {
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const isAllowanceExhausted = remainingSeconds <= 0;
    // State for Running Clock
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        name_of_personnel: auth.user?.name || '',
        designation: '',
        purpose: '',
        destination: '',
        nature_of_travel: 'Official',
        time_departure: new Date().toTimeString().slice(0, 5),
        time_arrival: '', // Left empty as this is a start form, or you can match current time
        representative_signature: '',
    });

    // 1. RUNNING CLOCK & AUTO-UPDATE
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            
            // Automatically update form data to match real-time
            setData(data => ({
                ...data,
                date: now.toISOString().split('T')[0],
                time_departure: now.toTimeString().slice(0, 5)
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 2. CHECK OVERTIME LIMIT
    // If remainingSeconds is <= 0, they are out of time.
    const isOvertime = remainingSeconds <= 0;
    
    // Lock logic: If Personal AND Overtime -> Lock Form
    const isLocked = data.nature_of_travel === 'Personal' && isOvertime;

    // Formatting Helper
    const formatTime = (seconds: number) => {
        const absSeconds = Math.max(0, seconds);
        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    // Nominatim Search Logic (Preserved)
    const searchLocation = async (query: string) => {
        if (query.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setIsSearching(true);
        setShowSuggestions(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ph`
            );
            const results = await response.json();
            setLocationSuggestions(results);
        } catch (error) {
            console.error('Location search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDestinationChange = (value: string) => {
        setData('destination', value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        if (value.length < 3) {
            setShowSuggestions(false);
            return;
        }
        
        typingTimeoutRef.current = setTimeout(() => searchLocation(value), 500);
    };

    const selectLocation = (location: any) => {
        setData('destination', location.display_name);
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('locator.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="w-full">
            {/* OVERTIME WARNING BANNER */}
            {isLocked && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-red-700">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Monthly Allowance Limit Reached</h4>
                            <p className="text-xs">You have exhausted your 4-hour limit. Please use the Leave Form.</p>
                        </div>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onRedirectToLeave}
                        className="whitespace-nowrap"
                    >
                        Go to Leave Form <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
            )}

            <Card className={`border-t-4 border-t-blue-500 shadow-sm transition-opacity ${isLocked ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                <CardHeader className="relative pb-2">
                    <CardTitle className="text-center text-2xl uppercase tracking-tight">
                        Personnel Locator Slip
                    </CardTitle>
                    
                    {/* Running Time Display */}
                    <div className="absolute top-4 right-4 text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Time</div>
                        <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                            {currentTime.toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Personal Time Remaining Badge */}
                    {data.nature_of_travel === 'Personal' && (
                        <div className={`mt-2 text-center text-sm font-medium border py-1 px-3 rounded-full w-fit mx-auto ${isOvertime ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            {isOvertime ? 'Limit Exceeded' : `${formatTime(remainingSeconds)} Remaining`}
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Date (Disabled/Auto) */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/3">
                                <Label htmlFor="date">Date of Filing</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    readOnly
                                    className="bg-slate-100 dark:bg-zinc-800 dark:text-slate-300 cursor-not-allowed font-medium text-slate-700"
                                />
                                <InputError message={errors.date} />
                            </div>
                        </div>

                        {/* Name & Designation (Compact Row) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name_of_personnel">Name of Personnel</Label>
                                <Input
                                    id="name_of_personnel"
                                    type="text"
                                    value={data.name_of_personnel}
                                    readOnly
                                    className="bg-slate-100 dark:bg-zinc-800 dark:text-slate-200 h-9 text-sm cursor-not-allowed font-medium"
                                />
                                <InputError message={errors.name_of_personnel} />
                            </div>

                           <div>
    <Label htmlFor="designation">Designation</Label>
    <Input
        id="designation"
        type="text"
        value={data.designation}
        onChange={(e) => setData('designation', e.target.value)}
        placeholder="Enter designation"
        className="h-9 text-sm"
    />
    <InputError message={errors.designation} />
</div>
                        </div>

                        {/* Purpose */}
                        <div>
                            <Label htmlFor="purpose">Purpose of Travel/Going Out</Label>
                            <Textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                placeholder="Enter purpose of travel or going out"
                                rows={3}
                            />
                            <InputError message={errors.purpose} />
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <Label htmlFor="destination">Specific Destination</Label>
                            <Input
                                id="destination"
                                type="text"
                                value={data.destination}
                                onChange={(e) => handleDestinationChange(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                                placeholder="Start typing location..."
                                autoComplete="off"
                            />
                            {showSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto"/></div>
                                    ) : locationSuggestions.length > 0 ? (
                                        locationSuggestions.map((loc, i) => (
                                            <div 
                                                key={i} 
                                                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer text-sm" 
                                                onMouseDown={() => selectLocation(loc)}
                                            >
                                                {loc.display_name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-muted-foreground text-center">No locations found</div>
                                    )}
                                </div>
                            )}
                            <InputError message={errors.destination} />
                        </div>

                        {/* Nature of Travel */}
                        <div>
                            <Label>Nature of Travel</Label>
                            <RadioGroup 
                                value={data.nature_of_travel} 
                                onValueChange={(value) => setData('nature_of_travel', value)}
                                className="flex gap-4 mt-2"
                            >
                                <div className={`flex items-center space-x-2 border dark:border-zinc-700 p-3 rounded-lg flex-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 ${data.nature_of_travel === 'Official' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <RadioGroupItem value="Official" id="official" />
                                    <Label htmlFor="official" className="cursor-pointer font-normal w-full text-slate-900 dark:text-slate-200">Official Business</Label>
                                </div>
                                <div className={`flex items-center space-x-2 border dark:border-zinc-700 p-3 rounded-lg flex-1 ${isAllowanceExhausted ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-zinc-900' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800'} ${data.nature_of_travel === 'Personal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <RadioGroupItem 
                                        value="Personal" 
                                        id="personal" 
                                        disabled={isAllowanceExhausted} // DISABLE HERE
                                    />
                                    <div className="w-full">
                                        <Label 
                                            htmlFor="personal" 
                                            className={`font-normal w-full block ${isAllowanceExhausted ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer text-slate-900 dark:text-slate-200'}`}
                                        >
                                            Personal Business
                                        </Label>
                                        {isAllowanceExhausted && (
                                            <span className="text-[10px] text-red-500 font-bold block mt-1">
                                                Allowance Limit Reached (0h left)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </RadioGroup>
                            <InputError message={errors.nature_of_travel} />
                        </div>

                        {/* Time Fields (Auto-updating) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="time_departure" className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                    <Clock className="w-3 h-3 text-blue-600"/> Time of Departure
                                </Label>
                                <Input
                                    id="time_departure"
                                    type="time"
                                    value={data.time_departure}
                                    readOnly
                                    className="bg-slate-100 dark:bg-zinc-800 font-mono text-center font-bold text-slate-800 dark:text-slate-200"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 text-center">Auto-set to current time</p>
                                <InputError message={errors.time_departure} />
                            </div>
                            
                            {/* Time Arrival (Read-only placeholder) */}
                            <div>
                                <Label htmlFor="time_arrival" className="text-muted-foreground">Time of Arrival / Return</Label>
                                <Input
                                    id="time_arrival"
                                    type="time"
                                    value={data.time_arrival}
                                    readOnly
                                    disabled
                                    className="bg-slate-50 dark:bg-zinc-900 text-slate-400 text-center"
                                    placeholder="--:--"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 text-center">To be recorded upon return</p>
                            </div>
                        </div>

                        {/* Signature Image */}
                        <div>
                            <div className="w-full h-32 mx-auto border dark:border-zinc-700 rounded-md flex flex-col items-center justify-center bg-white overflow-hidden">
                                <span className="text-xs text-muted-foreground mb-1">Electronic Signature</span>
                                {/* Signature Image */}
                                 <img 
  src="/images/esign.png" 
  alt="User Signature" 
  className="h-20 w-auto object-contain mix-blend-multiply"
/>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2">Signature of Requesting Personnel</p>
                        </div>

                        {/* Approved By */}
                        <div className="border-t dark:border-zinc-800 pt-4 mt-6">
                            <p className="text-center font-medium mb-4 text-xs uppercase tracking-wide text-muted-foreground">Approved By:</p>
                            
                            <div className="text-center">
                                <div className="font-bold text-lg text-slate-900 dark:text-white">ENGR. JANENY B. DOMINGSIL</div>
                                <div className="text-sm text-blue-600 font-medium">OIC-Chief Administrative Officer</div>
                            </div>
                        </div>

                        {/* Representative Signature */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                            <Label htmlFor="representative_signature" className="text-center block mb-2 text-yellow-800 dark:text-yellow-500 font-medium">
                                Name and Signature of Representative from Company/Institution Visited
                            </Label>
                            <Input
                                id="representative_signature"
                                type="text"
                                value={data.representative_signature}
                                onChange={(e) => setData('representative_signature', e.target.value)}
                                placeholder="Enter representative name (if applicable)"
                                className="text-center bg-white dark:bg-zinc-900 border-yellow-300 focus:border-yellow-500"
                            />
                            <InputError message={errors.representative_signature} />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={processing || isLocked}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 text-base shadow-md text-white"
                            >
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} 
                                Submit & Start Timer
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}