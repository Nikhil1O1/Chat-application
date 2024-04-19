import React, { useContext, useEffect, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo.jsx';
import { UserContext } from './UserContext';

export default function Chat() {
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const {username, id} = useContext(UserContext);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000')
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId,username}) => {
            people[userId] = username
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev){
        const messageData = JSON.parse(ev.data)
        // console.log('messageData', messageData)
        if ('online' in messageData){
            showOnlinePeople(messageData.online)
        }
    }

    const onlinePeopleFilter = {...onlinePeople};
    delete onlinePeopleFilter[id];
  return (
    <div className='flex h-screen'>
        <div className='bg-gradient-to-r from-gray-700 to-cyan-300 text-white w-1/3'>
            <Logo/>
            {username}
            {Object.keys(onlinePeople).map(userId => (
                <div key = {userId} onClick={() => setSelectedUserId(userId)} className={'border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer '+(userId === selectedUserId ? 'bg-gray-600' : '')}>
                    <Avatar/>
                    <span>{onlinePeople[userId]}</span>
                </div>
            ))}
        </div>
        <div className='flex flex-col bg-black text-white w-2/3 p-2'>
            <div className='flex-grow'>{!selectedUserId && (<div className='text-white flex h-full flex-grow items-center justify-center'>
                <div className=''>&larr; select a person from sidebar</div>
                </div>)}</div>
            <div className='flex gap-2'>
                <input type="text" 
                placeholder='message'
                 className='bg-white border p-2 rounded flex-grow' />
                 <button className='p-2 bg-black text-white rounded'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                </button>
                 
            </div>
        </div>
    </div>
  )
}
