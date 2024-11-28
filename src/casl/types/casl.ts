import { InferSubjects } from '@casl/ability';
import { CaslSubjectAll } from 'src/constants/enums';
import { AppAbility } from '../providers/casl-ability.factory';
import { UserDto } from 'src/shared/modules/user/dto/user.dto';
import { RoleDto } from 'src/shared/modules/role/dto/role.dto';

type InferModelSubjects = typeof UserDto | typeof RoleDto;

export type Subjects = InferSubjects<InferModelSubjects> | typeof CaslSubjectAll;

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
