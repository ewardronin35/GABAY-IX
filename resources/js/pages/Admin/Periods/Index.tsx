import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEventHandler } from "react";
import InputError from "@/components/input-error";

type Period = {
    id: number;
    name: string;
    academic_year: string;
    semester: number;
};

export default function Index({ auth, periods }: PageProps<{ periods: Period[] }>) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        academic_year: "",
        semester: 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("admin.periods.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Academic Periods" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>Academic Periods</CardTitle>
                                <CardDescription>
                                    Manage the academic years and semesters for
                                    batch processing.
                                </CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>Create New Period</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create Academic Period
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={submit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData("name", e.target.value)
                                                }
                                                placeholder="e.g., AY 2025-2026 - 1st Semester"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div>
                                            <Label htmlFor="academic_year">
                                                Academic Year
                                            </Label>
                                            <Input
                                                id="academic_year"
                                                value={data.academic_year}
                                                onChange={(e) =>
                                                    setData(
                                                        "academic_year",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., 2025-2026"
                                            />
                                            <InputError
                                                message={errors.academic_year}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="semester">Semester</Label>
                                            <Input
                                                id="semester"
                                                type="number"
                                                value={data.semester}
                                                onChange={(e) =>
                                                    setData(
                                                        "semester",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                min={1}
                                                max={2}
                                            />
                                            <InputError message={errors.semester} />
                                        </div>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? "Saving..." : "Save Period"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Semester</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {periods.map((period) => (
                                        <TableRow key={period.id}>
                                            <TableCell>{period.name}</TableCell>
                                            <TableCell>
                                                {period.academic_year}
                                            </TableCell>
                                            <TableCell>
                                                {period.semester}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}