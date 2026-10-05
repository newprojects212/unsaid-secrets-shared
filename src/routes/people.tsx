import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SiteLayout } from '@/components/SiteLayout';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/people')({
  head: () => ({meta: [{title:'People — Unsaid'},{name:'description',content:'Find anonymous voices by pseudonym on Unsaid.'},{property:'og:title',content:'People — Unsaid'},{property:'og:description',content:'Find anonymous voices by pseudonym on Unsaid.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
  component: PeoplePage,
});
function PeoplePage() {
  const [search,setSearch]=useState('');
  const [query,setQuery]=useState('');
  useEffect(()=>{const timer=setTimeout(()=>setQuery(search.trim()),300);return()=>clearTimeout(timer)},[search]);
  const {data,isLoading,error}=useQuery({queryKey:['people',query],enabled:query.length>=2,queryFn:async()=>{const {data,error}=await supabase.rpc('search_pseudonyms',{_query:query});if(error)throw error;return data as {pseudonym:string}[]}});
  return <SiteLayout><h1 className="text-4xl">People</h1><div className="relative mt-6 max-w-lg"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input aria-label="Search pseudonyms" placeholder="Search a pseudonym…" maxLength={80} className="pl-10" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="stagger-feed mt-8 grid gap-3 sm:grid-cols-2">{isLoading?[0,1,2].map(i=><div key={i} className="h-20 animate-pulse rounded bg-surface"/>):error?<p className="text-destructive">Couldn't search right now.</p>:data?.map(person=><Link key={person.pseudonym} to="/people/$pseudonym" params={{pseudonym:person.pseudonym}} className="quiet-card animate-rise flex items-center gap-3 p-5 hover:border-primary/40"><UserRound className="size-5 text-primary"/><span className="break-all font-serif text-xl">{person.pseudonym}</span></Link>)}</div>{query.length>=2&&!isLoading&&!error&&!data?.length&&<p className="mt-6 text-sm text-muted-foreground">No matching voices.</p>}</SiteLayout>;
}