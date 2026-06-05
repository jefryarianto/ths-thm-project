import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KartuAnggotaTemplate, KartuAnggotaTemplateProps } from './KartuAnggotaTemplate.js';
import { SertifikatPendadaranTemplate, SertifikatPendadaranTemplateProps } from './SertifikatPendadaranTemplate.js';
import { PiagamPrestasiTemplate, PiagamPrestasiTemplateProps } from './PiagamPrestasiTemplate.js';

export function renderKartuAnggota(props: KartuAnggotaTemplateProps): string {
  const element = React.createElement(KartuAnggotaTemplate, props);
  return renderToStaticMarkup(element);
}

export function renderSertifikatPendadaran(props: SertifikatPendadaranTemplateProps): string {
  const element = React.createElement(SertifikatPendadaranTemplate, props);
  return renderToStaticMarkup(element);
}

export function renderPiagamPrestasi(props: PiagamPrestasiTemplateProps): string {
  const element = React.createElement(PiagamPrestasiTemplate, props);
  return renderToStaticMarkup(element);
}
