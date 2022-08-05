import { ITag } from './itag';
export class SnippetForCollectionsViewModel
  implements ISnippetForCollectionsViewModel
{
  id = 0;
  jsonData = '';
  priority = 0;
  type = 0;
  status = 0;
  rawTags = '';
}

export interface ISnippetForCollectionsViewModel {
  id: number;
  jsonData: string;
  priority: number;
  type: number;
  status: number;
  rawTags: string;
}

export class SnippetForIndividualViewModel
  implements ISnippetForIndividualViewModel
{
  id = 0;
  jsonData = '';
  priority = 0;
  type = 0;
  status = 0;
  tags: ITag[] = [];
}
export interface ISnippetForIndividualViewModel {
  id: number;
  jsonData: string;
  priority: number;
  type: number;
  status: number;
  tags: ITag[];
}
