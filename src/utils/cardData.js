// Maps a raw business_cards row (snake_case, straight from Supabase) to the
// camelCase shape the card UI works with. Shared by the public card page and
// the dashboard preview so they always read the same fields the same way -
// on the same underlying data - and can never quietly drift apart.
export function dbRowToCard(row) {
  return {
    id: row.id,
    fullName: row.full_name || "",
    fullNameTh: row.full_name_th || "",
    nickname: row.nickname || "",
    jobTitle: row.job_title || "",
    jobTitleTh: row.job_title_th || "",
    department: row.department || "",
    company: row.company || "",
    companyTh: row.company_th || "",
    phone: row.phone || "",
    email: row.email || "",
    email2: row.email2 || "",
    website: row.website || "",
    address: row.address || "",
    bio: row.bio || "",
    bioTh: row.bio_th || "",
    photoUrl: row.photo_url || "",
    backgroundUrl: row.background_url || "",
    logoUrl: row.logo_url || "",
    lineId: row.line_id || "",
    lineUrl: row.line_url || "",
    wechatId: row.wechat_id || "",
    whatsappNumber: row.whatsapp_number || "",
    facebookUrl: row.facebook_url || "",
    instagramUrl: row.instagram_url || "",
    linkedinUrl: row.linkedin_url || "",
    tiktokUrl: row.tiktok_url || "",
    youtubeUrl: row.youtube_url || "",
    googleMapsUrl: row.google_maps_url || "",
  };
}
