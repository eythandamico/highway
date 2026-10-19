export const integrationCatalog = [
 {id:'email',name:'Email',description:'Sign-in codes and reviewed quote or invoice emails.',setup:'Resend account, verified sender domain and API key.'},
 {id:'twilio',name:'Business texts and calls',description:'Reviewed booking texts, customer replies and arrival updates.',setup:'Twilio account, business number, API key and signed callback configuration.'},
 {id:'stripe',name:'Invoice payments',description:'Create a reviewed card-payment link. Invoices update after a successful payment is confirmed.',setup:'Stripe platform credentials, webhook secret and a connected account for this business.'},
 {id:'google-calendar',name:'Google Calendar',description:'Connect a calendar and export a reviewed appointment. Repeat exports update the same event.',setup:'Google OAuth application and consent configuration.'},
 {id:'microsoft-calendar',name:'Outlook Calendar',description:'Connect Outlook and export a reviewed appointment. No attendee invitations are sent.',setup:'Microsoft OAuth application and consent configuration.'},
 {id:'ai',name:'Yardwork assistant',description:'Draft answers using a limited workspace snapshot. Optional photo analysis; suggestions never execute changes.',setup:'Workers AI binding, model selection and workspace activation.'},
 {id:'jev',name:'Request classification',description:'Suggest a category for an incoming request with a confidence score. Every result requires review.',setup:'TypeSafe API key and workspace activation.'},
 {id:'push',name:'Device notifications',description:'Opt-in notifications with private details kept off the lock screen.',setup:'VAPID keys, sender contact and device permission.'},
 {id:'jobs',name:'Background follow-up drafts',description:'Prepare enabled invoice and quote follow-ups while the app is closed. Drafts still require review before sending.',setup:'Queue worker, scheduled trigger and explicit activation.'},
 {id:'traffic',name:'Live traffic',description:'Traffic-aware arrival estimates for scheduled visits.',setup:'Google Routes API key and workspace assignment.'},
 {id:'search',name:'Public lead search',description:'Search publicly indexed posts for potential service requests.',setup:'Brave Search API key and workspace assignment.'},
 {id:'maps',name:'Maps and weather',description:'Find addresses, plan travel and check the local forecast.',setup:'No key required for current public endpoints; production usage policies and capacity still apply.'},
 {id:'zapier',name:'Zapier exports',description:'Reviewed exports to accounting, marketing and other supported destinations.',setup:'A customer-owned Zapier connection; configure in the catalog below.'},
] as const;
export type ServiceId=(typeof integrationCatalog)[number]['id'];
export type ServiceStatus={id:ServiceId;state:'needs_setup'|'configured'|'connected'|'available';actionable:boolean};
