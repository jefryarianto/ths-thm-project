import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,j as r}from"./iframe-Cx3N5IyB.js";import{n as i,t as a}from"./notification-bell-9ROucKO5.js";function o(e,t=200){return new Response(JSON.stringify(e),{status:t,headers:{"Content-Type":`application/json`}})}function s(e){let[t,n]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{let e=window.fetch.bind(window);return window.fetch=async(t,n)=>{let r=typeof t==`string`?t:t instanceof URL?t.href:t.url;if(r.includes(`/api/v1/notifications?limit=5`))return await new Promise(e=>setTimeout(e,300)),o({data:p});if(r.includes(`/api/v1/notifications/count`)){await new Promise(e=>setTimeout(e,200));let e=p.filter(e=>!e.isRead).length;return o({count:e})}return r.includes(`/api/v1/notifications/read-all`)?(await new Promise(e=>setTimeout(e,500)),o({})):r.match(/\/api\/v1\/notifications\/\d+\/read/)?(await new Promise(e=>setTimeout(e,200)),o({})):e(t,n)},n(!0),()=>{window.fetch=e}},[]),(0,u.jsx)(u.Fragment,{children:t?(0,u.jsx)(e,{}):null})}function c(e){let[t,n]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{let e=window.fetch.bind(window);return window.fetch=async(t,n)=>{let r=typeof t==`string`?t:t instanceof URL?t.href:t.url;return r.includes(`/api/v1/notifications`)?r.includes(`/count`)?o({count:0}):o({data:[]}):e(t,n)},n(!0),()=>{window.fetch=e}},[]),(0,u.jsx)(u.Fragment,{children:t?(0,u.jsx)(e,{}):null})}function l(e){let[t,n]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{let e=window.fetch.bind(window);return window.fetch=async(t,n)=>(typeof t==`string`?t:t instanceof URL?t.href:t.url).includes(`/api/v1/notifications`)?(await new Promise(e=>setTimeout(e,1e4)),o({data:[],count:0})):e(t,n),n(!0),()=>{window.fetch=e}},[]),(0,u.jsx)(u.Fragment,{children:t?(0,u.jsx)(e,{}):null})}var u,d,f,p,m,h,g,_,v;t((()=>{u=r(),i(),d=e(n()),f={title:`Layout/NotificationBell`,component:a,tags:[`autodocs`],parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}},layout:`fullscreen`,docs:{description:{component:`NotificationBell — Ikon lonceng dengan dropdown notifikasi.\r

### Fitur\r
- Badge jumlah notifikasi belum dibaca\r
- Dropdown daftar 5 notifikasi terbaru\r
- Tombol "Tandai dibaca" untuk mark all\r
- Tiap notifikasi bisa di-click untuk navigasi\r
- Link "Lihat Semua Notifikasi" ke /notifications\r

### Mock Data\r
Komponen menggunakan mock API via \`window.fetch\` override di decorator\r
untuk menampilkan data notifikasi tanpa perlu backend.\r

### State\r
| State | Default | Deskripsi |\r
|-------|---------|-----------|\r
| notifications | [] | Dari GET /notifications?limit=5 |\r
| unreadCount | 0 | Dari GET /notifications/count |\r
| open | false | Controlled dropdown state |`}}}},p=[{id:1,judul:`Iuran baru dari Andi Pratama`,pesan:`Pembayaran iuran bulan Juni 2026 sebesar Rp50.000 telah diterima.`,isRead:!1,linkTo:`/iuran`,createdAt:new Date(Date.now()-1e3*60*5).toISOString()},{id:2,judul:`Pendadaran dijadwalkan`,pesan:`Jadwal pendadaran untuk Andi Pratama telah ditetapkan pada 15 Juni 2026.`,isRead:!1,linkTo:`/pendadaran`,createdAt:new Date(Date.now()-1e3*60*30).toISOString()},{id:3,judul:`Kegiatan latihan dibatalkan`,pesan:`Latihan rutin hari ini dibatalkan karena cuaca buruk.`,isRead:!1,createdAt:new Date(Date.now()-1e3*60*60).toISOString()},{id:4,judul:`Anggota baru mendaftar`,pesan:`Budi Santoso telah mendaftar sebagai anggota baru.`,isRead:!0,linkTo:`/anggota`,createdAt:new Date(Date.now()-1e3*60*60*3).toISOString()},{id:5,judul:`Pengumuman organisasi`,pesan:`Rapat organisasi akan diadakan pada hari Sabtu, 10 Juni 2026 pukul 09:00 WIB.`,isRead:!0,createdAt:new Date(Date.now()-1e3*60*60*24).toISOString()}],m={decorators:[c]},h={name:`Dengan Notifikasi`,decorators:[s]},g={name:`Loading State`,decorators:[l],parameters:{chromatic:{disable:!0}}},_={name:`Banyak Unread`,decorators:[e=>{let t=Array.from({length:12},(e,t)=>({id:t+10,judul:`Notifikasi ${t+1}: ${[`Iuran`,`Kegiatan`,`Pendadaran`,`Latihan`,`Anggota`][t%5]}`,pesan:`Deskripsi untuk notifikasi nomor ${t+1}. Ini adalah pesan detail.`,isRead:t>=8,linkTo:t%2==0?`/iuran`:void 0,createdAt:new Date(Date.now()-1e3*60*t).toISOString()})),[n,r]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{let e=window.fetch.bind(window);return window.fetch=async n=>{let r=typeof n==`string`?n:n instanceof URL?n.href:n.url;return r.includes(`/api/v1/notifications?limit=5`)?(await new Promise(e=>setTimeout(e,200)),o({data:t.slice(0,5)})):r.includes(`/api/v1/notifications/count`)?(await new Promise(e=>setTimeout(e,100)),o({count:8})):r.includes(`/api/v1/notifications/read-all`)?(await new Promise(e=>setTimeout(e,500)),o({})):r.match(/\/api\/v1\/notifications\/\d+\/read/)?(await new Promise(e=>setTimeout(e,200)),o({})):e(n)},r(!0),()=>{window.fetch=e}},[]),(0,u.jsx)(u.Fragment,{children:n?(0,u.jsx)(e,{}):null})}]},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  decorators: [WithEmptyApi]
}`,...m.parameters?.docs?.source},description:{story:`Tidak ada notifikasi (empty state)`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Dengan Notifikasi",
  decorators: [WithMockApi]
}`,...h.parameters?.docs?.source},description:{story:`Menampilkan daftar notifikasi dengan data mock`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Loading State",
  decorators: [WithLoadingApi],
  parameters: {
    chromatic: {
      disable: true
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`Loading state — transient state, diskip di Chromatic visual test`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: "Banyak Unread",
  decorators: [Story => {
    const manyUnreadNotifications = Array.from({
      length: 12
    }, (_, i) => ({
      id: i + 10,
      judul: \`Notifikasi \${i + 1}: \${["Iuran", "Kegiatan", "Pendadaran", "Latihan", "Anggota"][i % 5]}\`,
      pesan: \`Deskripsi untuk notifikasi nomor \${i + 1}. Ini adalah pesan detail.\`,
      isRead: i >= 8,
      linkTo: i % 2 === 0 ? "/iuran" : undefined,
      createdAt: new Date(Date.now() - 1000 * 60 * i).toISOString()
    }));
    const [ready, setReady] = useState(false);
    useEffect(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url.includes("/api/v1/notifications?limit=5")) {
          await new Promise(r => setTimeout(r, 200));
          return mockFetchResponse({
            data: manyUnreadNotifications.slice(0, 5)
          });
        }
        if (url.includes("/api/v1/notifications/count")) {
          await new Promise(r => setTimeout(r, 100));
          return mockFetchResponse({
            count: 8
          });
        }
        if (url.includes("/api/v1/notifications/read-all")) {
          await new Promise(r => setTimeout(r, 500));
          return mockFetchResponse({});
        }
        if (url.match(/\\/api\\/v1\\/notifications\\/\\d+\\/read/)) {
          await new Promise(r => setTimeout(r, 200));
          return mockFetchResponse({});
        }
        return originalFetch(input);
      };
      setReady(true);
      return () => {
        window.fetch = originalFetch;
      };
    }, []);
    return <>{ready ? <Story /> : null}</>;
  }]
}`,..._.parameters?.docs?.source},description:{story:`Banyak notifikasi belum dibaca (8 unread, badge "9+")`,..._.parameters?.docs?.description}}},v=[`Default`,`WithNotifications`,`Loading`,`ManyUnread`]}))();export{m as Default,g as Loading,_ as ManyUnread,h as WithNotifications,v as __namedExportsOrder,f as default};