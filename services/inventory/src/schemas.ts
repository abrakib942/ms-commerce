import { ActionType } from '@prisma/client';
import {z} from 'zod';

export const InventoryCreateDtoSchema = z.object({ 
    productId: z.string(),
    sku: z.string(),
    quantity: z.number().int().optional().default(0),
 })

export const InventoryUpdateDtoSchema = z.object({ 
    quantity: z.number().int(),
    actionType: z.nativeEnum(ActionType)
 })