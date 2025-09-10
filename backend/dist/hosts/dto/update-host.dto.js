"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHostDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_host_dto_1 = require("./create-host.dto");
class UpdateHostDto extends (0, mapped_types_1.PartialType)(create_host_dto_1.CreateHostDto) {
}
exports.UpdateHostDto = UpdateHostDto;
//# sourceMappingURL=update-host.dto.js.map