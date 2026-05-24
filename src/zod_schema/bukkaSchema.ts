import z from 'zod';

export const BukkaSetupSchema = z.object({
  name: z
    .string('Bukka name must be a string')
    .min(1, 'Please enter your bukka name')
    .max(50, 'Bukka name too long.'),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number('Invalid coords').min(-180, 'Invalid long coords').max(180, 'Invlaid long coords'),
      z.number('Invalid coords').min(-90, 'Invalid lat coords').max(90, 'Invalid lat coords'),
    ]),
  }),
});
