import { ADD, VOTE } from './constants';
import { IIdea } from '../../ts/interfaces/IIdea';

import { action } from 'typesafe-actions';

export const vote = (id: string) => action(VOTE, id);
// (id: string) => { type: 'todos/TOGGLE'; payload: string; }

export const add = (idea: IIdea) => action(ADD, idea);
// (title: string) => { type: 'todos/ADD'; payload: Todo; }


