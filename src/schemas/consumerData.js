import Joi from '@hapi/joi';

const dataSchema = Joi.object({
	key: Joi.string().required(),
	value: Joi.any(),
	ttl: Joi.number().positive()
})

export const commandSchema = Joi.object({
	type: Joi.string().valid('db', 'store').required(),
	command: Joi.string().valid('get', 'set', 'delete').required(),
	namespace: Joi.string().required(),
	data: Joi.alternatives().try(Joi.array().items(dataSchema), dataSchema)
})
