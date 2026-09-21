import { getPreference, getSubscription, getUserById } from "../database/repositories/user-repository.mjs";
import { followedCount, listFollowedGames } from "../database/repositories/follow-repository.mjs";
import { listSavedKnowledge, savedKnowledgeCount } from "../database/repositories/saved-knowledge-repository.mjs";
import { listActivity, activityCount } from "../database/repositories/activity-repository.mjs";
import { favoriteGameCount, listFavoriteGames } from "../database/repositories/favorite-game-repository.mjs";
import { creatorOutputCount, listCreatorOutputs } from "../database/repositories/creator-repository.mjs";
import { ensureProfile, getProfileByUserId, getProfileByUsername } from "../database/repositories/profile-repository.mjs";
import { followerCount, followingCount, friendCount, listFollowers, listFollowing, listFriends, relationshipState } from "../database/repositories/social-repository.mjs";
import { accessSnapshotForUser } from "../access/capability-service.mjs";

export function buildProfile(userId){
  const user=getUserById(userId);if(!user)return null;const social=ensureProfile(userId),access=accessSnapshotForUser(userId);
  return {user:{...user,staffRole:access.staffRole,badge:access.badge,staffSuspended:access.suspended},socialProfile:social,preferences:getPreference(userId),subscription:getSubscription(userId),counts:{followedGames:followedCount(userId),favoriteGames:favoriteGameCount(userId),savedKnowledge:savedKnowledgeCount(userId),creatorOutputs:creatorOutputCount(userId),activity:activityCount(userId),followers:followerCount(userId),following:followingCount(userId),friends:friendCount(userId)},favoriteGames:listFavoriteGames(userId,{limit:24}),followedGames:listFollowedGames(userId,{limit:24}),savedKnowledge:listSavedKnowledge(userId,{limit:24}),creatorHistory:listCreatorOutputs(userId,{limit:12}),recentActivity:listActivity(userId,{limit:20}),followers:listFollowers(userId,{limit:12}),following:listFollowing(userId,{limit:12}),friends:listFriends(userId,{limit:12})};
}

export function canViewPublicProfile(targetUserId,viewerId=null){
  if(!targetUserId)return false;
  if(viewerId===targetUserId)return true;
  const visibility=String(getPreference(targetUserId)?.profileVisibility||"PUBLIC").toUpperCase();
  if(visibility==="PUBLIC")return true;
  if(visibility==="PRIVATE")return false;
  if(visibility==="FRIENDS")return Boolean(viewerId&&relationshipState(viewerId,targetUserId).friendship==="FRIENDS");
  return true;
}

export function buildPublicProfile({username,userId,viewerId=null}={}){
  const social=username?getProfileByUsername(username):getProfileByUserId(userId);if(!social)return null;const user=getUserById(social.userId);if(!user)return null;
  if(!canViewPublicProfile(user.id,viewerId))return null;
  const publicSocial={userId:social.userId,username:social.username,displayName:social.displayName,bio:social.bio,avatarUrl:social.avatarUrl,avatarDisplayUrl:social.avatarDisplayUrl,avatarRevision:social.avatarRevision,profileUrl:`/user.html?id=${encodeURIComponent(social.userId)}`,updatedAt:social.updatedAt};
  const access=accessSnapshotForUser(user.id);
  return {user:{id:user.id,displayName:social.displayName||user.displayName,createdAt:user.createdAt,badge:access.badge,staffRole:access.staffRole},socialProfile:publicSocial,counts:{followers:followerCount(user.id),following:followingCount(user.id),friends:friendCount(user.id),followedGames:followedCount(user.id),favoriteGames:favoriteGameCount(user.id)},friends:listFriends(user.id,{limit:12}),favoriteGames:listFavoriteGames(user.id,{limit:20}),followedGames:listFollowedGames(user.id,{limit:20}),relationship:relationshipState(viewerId,user.id)};
}
