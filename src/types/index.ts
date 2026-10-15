export interface ArtField {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  value: string;
  x: number;
  y: number;
  width: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  color: string;
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  uppercase: boolean;
  bgEnabled: boolean;
  bgColor: string;
  bgPadding: number;
  bgRadius: number;
}

export interface ArtTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  backgroundDataUrl: string;
  fields: ArtField[];
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  templateId: string;
  templateName: string;
  category: string;
  format: 'PNG' | 'JPG';
  values: Record<string, string>;
}

export interface SectorRequest {
  id: string;
  createdAt: string;
  department: string;
  requester: string;
  templateId: string;
  templateName: string;
  status: 'Pendente' | 'Concluído';
  fieldValues: Record<string, string>;
}

export type StageKey = 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4' | 'stage-5';

export interface FieldHitBox {
  x: number;
  y: number;
  w: number;
  h: number;
  handleX: number;
  handleY: number;
}
