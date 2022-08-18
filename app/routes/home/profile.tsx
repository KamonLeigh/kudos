import { useState } from 'react';
import { useLoaderData } from "@remix-run/react";
import {  json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import type { Department} from "@prisma/client"
import {  getUser, requireUserId} from "~/utils/auth.server";
import { departments } from "~/utils/constants";
import { validateName } from '~/utils/validators.server'
import { updateUser } from '~/utils/user.server';
import { FormField } from "~/components/form-field";
import { Modal } from "~/components/modal";
import {  SelectBox } from "~/components/select-box";
import { ImageUploader } from "~/components/image-uploader";



export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request)
    const form = await request.formData();

    let firstName = form.get('firstName');
    let lastName = form.get('lastName')
    let department = form.get('department')

    if (
        typeof firstName !== 'string'
        || typeof lastName !== 'string'
        || typeof department !== 'string'
    ) {
        return json({ error: 'Invalid Form Data'}, { status: 400})
    }

    const errors = {
        firstName: validateName(firstName),
        lastName: validateName(lastName),
        department: validateName(firstName)
    }

    if (Object.values(errors).some(Boolean)) {
        return json({errors, fields: { department, firstName, lastName}}, { status: 400})
    }

    await updateUser(userId, {
        firstName,
        lastName,
        department: department as Department
    })
    return redirect('/home')
}

export const loader: LoaderFunction = async ({ request}) => {
    const user = await getUser(request);
  
    return json({ user })
}

export default function ProfileSettings() {
    const { user } = useLoaderData();


    const [formData, setFormData] = useState({
        firstName:  user?.profile?.firstName,
        lastName: user?.profile?.lastName,
        department: (user?.profilee?.department || 'MARKETING'),
        profilePicture: user?.profile?.profilePiture || ''
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData( form => ({ ...form, [field] : event.target.value }))
    }

    const handleFileUpload = async (file: File) => {
        let inputFormData = new FormData();
        inputFormData.append('profile-pic', file)

        console.log(file)
        console.log('=========')
        console.log(inputFormData.get('profile-pic'))
        const response = await fetch('/avatar',{
             method: 'POST',
             body: inputFormData
        })

        const { imageUrl } = await response.json()    
        
        setFormData({
            ...formData,
            profilePicture: imageUrl
        })
    }

    return (
        <Modal isOpen={true} className="w-1/3">
            <div className="p-3">
                <h2 className="text-4xl font-semibold text-blue-600 text-center mb-4">Your Profile</h2>

                    <div className="flex">
                        <div className='W-1/3'>
                            <ImageUploader onChange={handleFileUpload} imageUrl={formData?.profilePicture || ''}/>
                        </div>
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