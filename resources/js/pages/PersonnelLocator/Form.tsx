import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
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
import { Loader2 } from 'lucide-react';

type FormPageProps = PageProps & {
    consumedSeconds: number;
    remainingSeconds: number;
};

export default function Index({ auth, consumedSeconds, remainingSeconds }: FormPageProps) {
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentDuration, setCurrentDuration] = useState(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        name_of_personnel: auth.user?.name || '',
        designation: '',
        purpose: '',
        destination: '',
        nature_of_travel: 'Official',
        time_departure: new Date().toTimeString().slice(0, 5),
        time_arrival: new Date().toTimeString().slice(0, 5),
        representative_signature: '',
    });

    // Calculate current trip duration in real-time
    useEffect(() => {
        const calculateDuration = () => {
            if (!data.time_departure || !data.time_arrival) return 0;

            const [depHour, depMin] = data.time_departure.split(':').map(Number);
            const [arrHour, arrMin] = data.time_arrival.split(':').map(Number);

            let depSeconds = depHour * 3600 + depMin * 60;
            let arrSeconds = arrHour * 3600 + arrMin * 60;

            // Handle cross-midnight
            if (arrSeconds < depSeconds) {
                arrSeconds += 24 * 3600; // Add 24 hours
            }

            return arrSeconds - depSeconds;
        };

        const duration = calculateDuration();
        setCurrentDuration(duration);
    }, [data.time_departure, data.time_arrival]);

    // Optimized timer for arrival time: only update when minute changes
    useEffect(() => {
        const updateArrivalTime = () => {
            const now = new Date();
            const timeString = now.toTimeString().slice(0, 5);
            setData('time_arrival', timeString);
        };

        // Calculate milliseconds until next minute
        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        // Set timeout for next minute, then interval every 60s
        const initialTimeout = setTimeout(() => {
            updateArrivalTime();
            const interval = setInterval(updateArrivalTime, 60000); // Every 60 seconds
            return () => clearInterval(interval);
        }, msUntilNextMinute);

        return () => clearTimeout(initialTimeout);
    }, []);

    // Nominatim location search with debounce
    const searchLocation = async (query: string) => {
        if (query.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setShowSuggestions(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ph`,
                {
                    headers: {
                        'User-Agent': 'CHED-GABAY-IX-PersonnelLocator/1.0'
                    }
                }
            );
            const results = await response.json();
            setLocationSuggestions(results);
            setIsSearching(false);
        } catch (error) {
            console.error('Location search error:', error);
            setLocationSuggestions([]);
            setIsSearching(false);
        }
    };

    const handleDestinationChange = (value: string) => {
        setData('destination', value);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Reset states
        if (value.length < 3) {
            setShowSuggestions(false);
            setIsSearching(false);
            setLocationSuggestions([]);
            return;
        }

        // Set new timeout (debounce)
        typingTimeoutRef.current = setTimeout(() => {
            searchLocation(value);
        }, 500);
    };

    const selectLocation = (location: any) => {
        setData('destination', location.display_name);
        setShowSuggestions(false);
        setLocationSuggestions([]);
        setIsSearching(false);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('personnel-locator.store'), {
            onSuccess: () => {
                reset();
                // Reset times to current
                const now = new Date().toTimeString().slice(0, 5);
                setData('time_departure', now);
                setData('time_arrival', now);
            },
        });
    };

    // Calculate remaining time for personal travel
    const totalRemainingSeconds = remainingSeconds - currentDuration;
    const isOvertime = totalRemainingSeconds < 0;

    // Disable Personal option if user already exceeded monthly limit at page load
    const isPersonalDisabled = remainingSeconds <= 0;

    const formatTime = (seconds: number) => {
        const absSeconds = Math.abs(seconds);
        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <AppLayout user={auth.user} page_title="Personnel Locator Slip">
            <Head title="Personnel Locator Slip" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="relative">
                            <CardTitle className="text-center text-2xl">
                                PERSONNEL LOCATOR SLIP
                            </CardTitle>

                            {/* Personal Time Counter - Only show when Personal is selected */}
                            {data.nature_of_travel === 'Personal' && (
                                <div className={`absolute top-4 right-4 text-right font-mono text-sm ${
                                    isOvertime ? 'text-red-600 font-bold' : 'text-green-600'
                                }`}>
                                    <div className="text-xs opacity-70 mb-1">Personal Time</div>
                                    <div className="text-lg">
                                        {isOvertime ? '-' : ''}{formatTime(totalRemainingSeconds)}
                                    </div>
                                    {isOvertime && (
                                        <div className="text-xs font-bold mt-1">OVERTIME</div>
                                    )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Date - Right aligned */}
                                <div className="flex justify-end">
                                    <div className="w-full md:w-1/3">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                        />
                                        <InputError message={errors.date} />
                                    </div>
                                </div>

                                {/* Name of Personnel (Read-only) */}
                                <div>
                                    <Label htmlFor="name_of_personnel">Name of Personnel</Label>
                                    <Input
                                        id="name_of_personnel"
                                        type="text"
                                        value={data.name_of_personnel}
                                        readOnly
                                        className="bg-muted"
                                    />
                                    <InputError message={errors.name_of_personnel} />
                                </div>

                                {/* Designation - Dropdown */}
                                <div>
                                    <Label htmlFor="designation">Designation</Label>
                                    <Select
                                        value={data.designation}
                                        onValueChange={(value) => setData('designation', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.designation} />
                                </div>

                                {/* Purpose of Travel/Going Out */}
                                <div>
                                    <Label htmlFor="purpose">Purpose of Travel/Going Out</Label>
                                    <Textarea
                                        id="purpose"
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                        placeholder="Enter purpose of travel or going out"
                                        rows={4}
                                    />
                                    <InputError message={errors.purpose} />
                                </div>

                                {/* Specific Destination with Autocomplete */}
                                <div className="relative">
                                    <Label htmlFor="destination">Specific Destination</Label>
                                    <Input
                                        id="destination"
                                        type="text"
                                        value={data.destination}
                                        onChange={(e) => handleDestinationChange(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                                        onFocus={() => {
                                            if (data.destination.length >= 3) {
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        placeholder="Start typing location..."
                                        autoComplete="off"
                                    />

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && (
                                        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                            {isSearching ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                    <span className="ml-2 text-sm text-muted-foreground">Searching locations...</span>
                                                </div>
                                            ) : locationSuggestions.length > 0 ? (
                                                locationSuggestions.map((location, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b border-border last:border-b-0"
                                                        onMouseDown={() => selectLocation(location)}
                                                    >
                                                        {location.display_name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                    No locations found. Try a different search term.
                                                </div>
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
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Official" id="official" />
                                            <Label htmlFor="official" className="font-normal">
                                                Official
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="Personal"
                                                id="personal"
                                                disabled={isPersonalDisabled}
                                            />
                                            <Label
                                                htmlFor="personal"
                                                className={`font-normal ${isPersonalDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Personal
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    {isPersonalDisabled && (
                                        <p className="text-xs text-destructive mt-2">
                                            Personal travel option disabled: Monthly 4-hour limit exceeded
                                        </p>
                                    )}
                                    <InputError message={errors.nature_of_travel} />
                                </div>

                                {/* Time Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="time_departure">Time of Departure</Label>
                                        <Input
                                            id="time_departure"
                                            type="time"
                                            value={data.time_departure}
                                            readOnly
                                            className="bg-muted"
                                        />
                                        <InputError message={errors.time_departure} />
                                    </div>
                                    <div>
                                        <Label htmlFor="time_arrival">Time of Arrival / Return</Label>
                                        <Input
                                            id="time_arrival"
                                            type="time"
                                            value={data.time_arrival}
                                            readOnly
                                            className="bg-muted"
                                        />
                                        <InputError message={errors.time_arrival} />
                                    </div>
                                </div>

                                {/* Signature Placeholder */}
                                <div>
                                    <div className="w-48 h-24 mx-auto border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/50">
                                        <span className="text-sm text-muted-foreground">Signature Image</span>
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground mt-2">Signature</p>
                                </div>

                                {/* Approved By */}
                                <div className="border-t pt-4 mt-6">
                                    <p className="text-center font-medium mb-4">
                                        Approved:
                                    </p>
                                    <p className="text-center font-bold">
                                        ENGR. JANENY B. DOMINGSIL
                                    </p>
                                    <p className="text-center text-sm text-muted-foreground">
                                        OIC-Chief Administrative Officer
                                    </p>
                                </div>

                                {/* Representative Signature */}
                                <div>
                                    <Label htmlFor="representative_signature" className="text-center block mb-2">
                                        Name and Signature of Representative from Company/Institution Visited
                                    </Label>
                                    <Input
                                        id="representative_signature"
                                        type="text"
                                        value={data.representative_signature}
                                        onChange={(e) => setData('representative_signature', e.target.value)}
                                        placeholder="Type representative name"
                                        className="text-center"
                                    />
                                    <InputError message={errors.representative_signature} />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
