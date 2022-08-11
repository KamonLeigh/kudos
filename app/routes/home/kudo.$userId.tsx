import type { LoaderFunction, ActionFunction} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Modal } from "~/components/modal";
import { SelectBox } from "~/components/select-box";
import { colorMap, emojiMap } from "~/utils/constants";
import { useLoaderData,  useActionData } from "@remix-run/react";
import React, { useState } from 'react'
import { getUserById } from "~/utils/user.server";
import { requireUserId } from "~/utils/auth.server";
import { createKudo } from "~/utils/kudos.server";
import { getUser } from "~/utils/auth.server";
import type {  KudoStyle, Colour, Emoji} from "@prisma/client";
import { UserCircle } from "~/components/user-circle";
import {  Kudo } from "~/components/kudo";


export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const form = await request.formData();
    const message = form.get('message')
    const backgroundColour = form.get('backgroundColour');
    const textColour = form.get('textColour');
    const emoji = form.get('emoji');
    const recipientId = form.get('recipientId');

    if (
        typeof message !== 'string' ||
        typeof recipientId !== 'string' ||
        typeof backgroundColour !== 'string' ||
        typeof textColour !== 'string' ||
        typeof emoji !== 'string' 
        ) {
       
         return json({ error: 'Invalid Form Data'}, { status: 400})
    }

    if (!recipientId.length) {
        return json({ error: 'No recipient found...'}, { status: 400})
    }

    await createKudo(message, userId, recipientId, {
        backgroundColour: backgroundColour as Colour,
        textColour: textColour as Colour,
        emoji: emoji as Emoji
    })

    return redirect('/home')
}


export const loader: LoaderFunction = async({ request, params}) => {
    const { userId } = params

    if (typeof userId !== 'string') {
        return redirect('/home')
    }
    const recipient = await getUserById(userId);
    const user = await getUser(request)

    return json({ recipient, user})
}

export default function KudoModal() {
    const actionData = useActionData()
    const [formError] = useState(actionData?.error || '');

    const [formData, setFormData] = useState({
        message: '',
        style: {
            backgroundColour: 'RED',
            textColour: 'WHITE',
            emoji: 'THUMBSUP'
        } as KudoStyle
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setFormData(data => ({ ...data, [field]: e.target.value }))
    }

    const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>, field: string) => {
        setFormData(data => ({
            ...data, style: {
                ...data.style,
                [field]: e.target.value
             }
            }))
    }

    const getOptions = (data: any) => Object.keys(data).reduce((acc: any[], curr) => {
        acc.push({
            name: curr.charAt(0).toUpperCase() + curr.slice(1).toLowerCase(),
            value: curr
        })
        return acc
    }, [])

    const colours = getOptions(colorMap);
    const emojis = getOptions(emojiMap);


    const { recipient, user } = useLoaderData();
    return (
        <Modal isOpen={true} className="w-2/3 p-10">
            <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full mb-2">{formError}</div>
            <h2> User: {recipient.profile.firstName} {recipient.profile.lastName}</h2>
            <form method="post">
                <input type="hidden" value={recipient.id} name="recipientId"/>
                <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0">
                    <div className="text-center flex flex-col items-center gap-y-2 pr-8">
                        <UserCircle profile={recipient.profile} className="h-24 w-24"/>
                        <p className="text-blue-300">
                            {recipient.profile.firstName} {recipient.profile.lastName}
                        </p>
                        {recipient.profile.department && (
                            <span className="px-2 py-1 bg-gray-300 rounded-xl text-blue-300 w-auto">
                                {recipient.profile.department[0].toUpperCase() + recipient.profile.department.toLowerCase().slice(1)}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col gap-y-4">
                        <textarea
                            name="message"
                            className="w-full rounded-xl h-40 p-4"
                            value={formData.message}
                            onChange={e => handleChange(e, 'message')}
                            placeholder={`Say something nice ${recipient.profile.firstName}`}
                        />
                        <div className="flex flex-col items-center md:flex-row md:justify-start gap-x-4">
                            <SelectBox
                                options={colours}
                                name="backgroundColour"
                                value={formData.style.backgroundColour}
                                label="Background Colour"
                                containerClassName="w-36"
                                onChange={e => handleStyleChange(e, 'backgroundColour')}
                                className="w-full rounded-xl px-3 py-2 text-gray-400"
                            />
                            <SelectBox
                                options={colours}
                                name="textColour"
                                value={formData.style.textColour}
                                label="Text Colour"
                                onChange={e => handleStyleChange(e, 'textColour')}
                                containerClassName="w-36"
                                className="w-full rounded-xl px-3 py-2 text-gray-400"
                            />
                            <SelectBox
                                options={emojis}
                                name="emoji"
                                value={formData.style.textColour}
                                label="Emoji"
                                onChange={e => handleStyleChange(e, 'emoji')}
                                containerClassName="w-36"
                                className="w-full rounded-xl px-3 py-2 text-gray-400"
                            />
                            
                        </div>
                    </div>

                </div>
                <br/>
                <p className="text-blue-600 font-semibold">Preview</p>
                <div className="flex flex-col items-center md:flex-row gap-x-24 gap-y-2 md:gap-y-0">
                <div className="flex-1"/>
                    <Kudo profile={user.profile} kudo={formData}/>
                    <button
                        type="submit"
                        className="rounded-xl bg-yellow-300 font-semibold text-blue-600 w-80 h-12 duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                    >
                        Send
                    </button>
                </div>
            </form>
           
        </Modal>
    )
}
