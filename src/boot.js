import {usesShared} from './shared/config.js';
import {startApplication} from './app.js';
if(location.hash.startsWith('#rsvp/')){const {startRsvp}=await import('./rsvp-ui.js');await startRsvp(location.hash.slice(6));}else if(usesShared()){const {startShared}=await import('./shared/auth-ui.js');await startShared(startApplication);}else startApplication();
