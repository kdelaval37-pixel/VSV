import {usesShared} from './shared/config.js';
import {startApplication} from './app.js';
if(usesShared()){const {startShared}=await import('./shared/auth-ui.js');await startShared(startApplication);}else startApplication();
