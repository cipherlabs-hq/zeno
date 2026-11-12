import '@usezeno/tokens/css';
import '../../shared/page.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
