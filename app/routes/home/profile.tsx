import { useState } from 'react';
import { useLoaderData } from "@remix-run/react";
import {  json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import {  getUser} from "~/utils/auth.server";
import { departments } from "~/utils/constants";
import { FormField } from "~/components/form-field";
import { Modal } from "~/components/modal";
import {  SelectBox } from "~/components/select-box";

export const loader: LoaderFunction = async ({ request}) => {
    const user = await getUser(request);
  
    return json({ user })
}

export default function ProfileSettings() {
    const { user } = useLoaderData();


    const [formData, setFormData] = useState({
        firstName:  user?.profile?.firstName,
        lastName: user?.profile?.lastName,
        department: (user?.profilee?.department || 'MARKETING')
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData( form => ({ ...form, [field] : event.target.value }))
    }

    return (
        <Modal isOpen={true} className="w-1/3">
            <div className="p-3">
                <h2 className="text-4xl font-semibold text-blue-600 text-center mb-4">Your Profile</h2>
                    <div className="flex">
                        <div className="flex-1">
                            <form method="post">
                                <FormField htmlFor="firstName" label="First Name" value={formData.firstName} onChange={ e => handleInputChange(e, 'firstName')} />
                                <FormField htmlFor="lastName" label="Last Name" value={formData.firstName} onChange={ e => handleInputChange(e, 'lastName')} />
                                <SelectBox
                                    className='w-full rounded-xl px-3 py-2 text-gray-400'
                                    id="department"
                                    label='Department'
                                    options={departments}
                                    value={formData.department}
                                    onChange={e => handleInputChange(e , 'department')}
                                />
                                <div className="w-full text-right mt-4">
                                    <button className="rounded-xl bg-yellow-300 font-semibold text-blue-600 px-16 py-2 transiion duration-300 ease-in-out hover:g-yellow-400">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            </div>
        </Modal>
    )
}