import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,M as r,N as i,j as a}from"./iframe-Cx3N5IyB.js";import{n as o,t as s}from"./button-1uNtGEHO.js";import{n as c,t as l}from"./utils-CMVnEVHk.js";import{B as u,Et as d,J as f,K as p,P as m,St as h,X as g,b as _,bt as v,ft as y,i as b,it as x,nt as S,o as C,t as w,ut as T,wt as E}from"./lucide-react-C2wKu_9A.js";import{n as D,t as O}from"./link-Do1_7Dw6.js";import{n as k,r as A,t as j}from"./dist-d3VYio5a.js";import{n as M,t as N}from"./separator-D73fDbtQ.js";function P(){let e=i(),[t,n]=(0,I.useState)(!1),r=t=>t===`/`?e===`/`:e.startsWith(t);return(0,F.jsxs)(`aside`,{className:l(`flex flex-col border-r bg-sidebar transition-all duration-300`,t?`w-16`:`w-60`),children:[(0,F.jsxs)(`div`,{className:`flex h-14 items-center gap-2 px-4`,children:[(0,F.jsx)(`div`,{className:`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground`,children:`TH`}),!t&&(0,F.jsx)(`span`,{className:`text-sm font-semibold tracking-tight`,children:`THS THM Admin`})]}),(0,F.jsx)(N,{}),(0,F.jsxs)(`nav`,{className:`flex-1 space-y-1 overflow-y-auto p-2`,children:[(0,F.jsxs)(`div`,{className:`space-y-1`,children:[!t&&(0,F.jsx)(`p`,{className:`px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground`,children:`Utama`}),L.map(e=>(0,F.jsxs)(D,{href:e.href,className:l(`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`,r(e.href)?`bg-sidebar-accent text-sidebar-accent-foreground`:`text-sidebar-foreground`,t&&`justify-center px-0`),title:t?e.label:void 0,children:[(0,F.jsx)(e.icon,{className:`h-4 w-4 shrink-0`}),!t&&(0,F.jsx)(`span`,{children:e.label})]},e.href))]}),(0,F.jsx)(N,{className:`my-3`}),(0,F.jsxs)(`div`,{className:`space-y-1`,children:[!t&&(0,F.jsx)(`p`,{className:`px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground`,children:`Lainnya`}),R.map(e=>(0,F.jsxs)(D,{href:e.href,className:l(`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`,r(e.href)?`bg-sidebar-accent text-sidebar-accent-foreground`:`text-sidebar-foreground`,t&&`justify-center px-0`),title:t?e.label:void 0,children:[(0,F.jsx)(e.icon,{className:`h-4 w-4 shrink-0`}),!t&&(0,F.jsx)(`span`,{children:e.label})]},e.href))]})]}),(0,F.jsx)(N,{}),(0,F.jsx)(`div`,{className:`p-2`,children:(0,F.jsx)(s,{variant:`ghost`,size:`sm`,className:`w-full justify-center`,onClick:()=>n(!t),children:t?(0,F.jsx)(T,{className:`h-4 w-4`}):(0,F.jsx)(y,{className:`h-4 w-4`})})})]})}var F,I,L,R,z=t((()=>{F=a(),I=e(n()),O(),r(),c(),o(),M(),w(),L=[{label:`Dashboard`,href:`/`,icon:u},{label:`Anggota`,href:`/anggota`,icon:C},{label:`Iuran`,href:`/iuran`,icon:b},{label:`Organisasi`,href:`/organisasi`,icon:h},{label:`Kegiatan`,href:`/kegiatan`,icon:v},{label:`Latihan`,href:`/latihan`,icon:S}],R=[{label:`Konten`,href:`/konten`,icon:f},{label:`Surat`,href:`/surat`,icon:m},{label:`Pendadaran`,href:`/pendadaran`,icon:p},{label:`Pustaka`,href:`/pustaka`,icon:E},{label:`Dokumen`,href:`/dokumen`,icon:g},{label:`Users & Roles`,href:`/users`,icon:_},{label:`Audit Trail`,href:`/audit`,icon:x},{label:`Notifikasi`,href:`/notifications`,icon:d}],P.__docgenInfo={description:``,methods:[],displayName:`Sidebar`}})),B,V,H,U,W,G,K,q,J,Y;t((()=>{z(),j(),B={title:`Layout/Sidebar`,component:P,tags:[`autodocs`],parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}},layout:`fullscreen`,docs:{description:{component:`Sidebar navigasi utama aplikasi THS THM Admin.\r

Terdiri dari:\r
- **Utama**: Dashboard, Anggota, Iuran, Organisasi, Kegiatan, Latihan\r
- **Lainnya**: Konten, Surat, Pendadaran, Pustaka, Dokumen, Users & Roles, Audit Trail, Notifikasi\r

Menggunakan Next.js Link untuk navigasi. Storybook Next.js framework\r
otomatis menangani routing mock.\r

Gunakan viewport toolbar untuk melihat responsive behavior.\r
Sidebar menyempit ke mode collapsed di viewport kecil.`}}}},V={parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}}}},H={name:`Active — Anggota`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/anggota`}}}},U={name:`Active — Iuran`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/iuran`}}}},W={name:`Active — Notifikasi`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/notifications`}}}},G={name:`Collapsed Mode`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/`}}},play:async({canvasElement:e})=>{let t=A(e).getByRole(`button`);await k.click(t)}},K={name:`Mobile`,parameters:{viewport:{defaultViewport:`mobile`},nextjs:{appDirectory:!0,navigation:{pathname:`/`}}},play:async({canvasElement:e})=>{let t=A(e).getByRole(`button`);await k.click(t)}},q={name:`Tablet`,parameters:{viewport:{defaultViewport:`tablet`},nextjs:{appDirectory:!0,navigation:{pathname:`/`}}}},J={name:`Collapsed — Anggota`,parameters:{nextjs:{appDirectory:!0,navigation:{pathname:`/anggota`}}},play:async({canvasElement:e})=>{let t=A(e).getByRole(`button`);await k.click(t)}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: "Active — Anggota",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/anggota"
      }
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: "Active — Iuran",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/iuran"
      }
    }
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: "Active — Notifikasi",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/notifications"
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: "Collapsed Mode",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Find and click the collapse toggle button (ChevronLeft icon)
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: "Mobile",
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  }
}`,...K.parameters?.docs?.source},description:{story:`Mobile viewport — collapsed by default via play function`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: "Tablet",
  parameters: {
    viewport: {
      defaultViewport: "tablet"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}`,...q.parameters?.docs?.source},description:{story:`Tablet viewport`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: "Collapsed — Anggota",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/anggota"
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  }
}`,...J.parameters?.docs?.source}}},Y=[`Expanded`,`OnAnggotaPage`,`OnIuranPage`,`OnNotificationsPage`,`Collapsed`,`OnMobile`,`OnTablet`,`CollapsedOnAnggota`]}))();export{G as Collapsed,J as CollapsedOnAnggota,V as Expanded,H as OnAnggotaPage,U as OnIuranPage,K as OnMobile,W as OnNotificationsPage,q as OnTablet,Y as __namedExportsOrder,B as default};