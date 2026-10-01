import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger } from '@/components/ui/dialog';
export const messageSafetyNotice = 'Messages are not end-to-end encrypted. The site admin can review conversations for safety and abuse handling.';
export function MessageRequestButton({targetType,targetId}:{targetType:'post'|'comment';targetId:string}) {
 const {user}=useAuth(); const navigate=useNavigate(); const [open,setOpen]=useState(false); const [text,setText]=useState(''); const [busy,setBusy]=useState(false);
 async function send(){if(!user){toast('Sign in to send a message.');return} if(!text.trim()||text.trim().length>500)return;setBusy(true);const {data,error}=await supabase.rpc('request_message',{_target_type:targetType,_target_id:targetId,_body:text.trim()});setBusy(false);if(error){toast(error.message);return}setOpen(false);setText('');if(data)navigate({to:'/messages',search:{conversation:data}})}
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground"><MessageCircle className="size-3.5"/> Send a private message</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Send a message request</DialogTitle><DialogDescription>{messageSafetyNotice}</DialogDescription></DialogHeader><Textarea value={text} onChange={e=>setText(e.target.value)} maxLength={500} rows={5} placeholder="Write one gentle opening message…"/><div className="text-right text-xs text-muted-foreground">{text.length}/500</div><DialogFooter><Button disabled={busy||!text.trim()} onClick={send}>Send request</Button></DialogFooter></DialogContent></Dialog>
}
