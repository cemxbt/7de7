// Friend system: every profile has a 6-char friend code; requests flow
// code -> pending -> accepted, and friends can be challenged directly.
import { supabase } from './online';

export interface FriendProfile {
  id: string;
  name: string;
  avatar: string;
}

export interface Friendship {
  id: string;
  requester: string;
  addressee: string;
  status: 'pending' | 'accepted';
  requester_profile: { name: string; avatar: string } | null;
  addressee_profile: { name: string; avatar: string } | null;
}

const COLS = 'id,requester,addressee,status,'
  + 'requester_profile:profiles!friends_requester_fkey(name,avatar),'
  + 'addressee_profile:profiles!friends_addressee_fkey(name,avatar)';

export async function fetchMyFriendCode(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('friend_code')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.friend_code as string | undefined) ?? null;
}

export async function findProfileByCode(code: string): Promise<FriendProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,avatar')
    .eq('friend_code', code.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data as FriendProfile | null;
}

export async function fetchFriendships(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friends')
    .select(COLS)
    .or(`requester.eq.${userId},addressee.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Friendship[];
}

/**
 * Sends a friend request to the owner of `code`.
 * If they already requested me, the friendship is accepted instead.
 * Returns the resulting status, or throws on unknown code / self-add.
 */
export async function addFriendByCode(userId: string, code: string): Promise<'pending' | 'accepted' | 'exists'> {
  const other = await findProfileByCode(code);
  if (!other) throw new Error('not-found');
  if (other.id === userId) throw new Error('self');

  const { data: existing } = await supabase
    .from('friends')
    .select('id,requester,status')
    .or(`and(requester.eq.${userId},addressee.eq.${other.id}),and(requester.eq.${other.id},addressee.eq.${userId})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') return 'exists';
    if (existing.requester === other.id) {
      // they already asked first — accept
      await acceptRequest(existing.id as string);
      return 'accepted';
    }
    return 'pending'; // I already asked, still waiting
  }

  const { error } = await supabase
    .from('friends')
    .insert({ requester: userId, addressee: other.id });
  if (error) throw error;
  return 'pending';
}

export async function acceptRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);
  if (error) throw error;
}

/** decline a request or remove a friend */
export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friends').delete().eq('id', friendshipId);
  if (error) throw error;
}
