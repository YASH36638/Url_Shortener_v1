import z from 'zod';

export const shortenerSchema = z.object({
    url:z.string({required_error:"Url is Required"}).trim().url({valid_url:"Enter valid Url"}).max(1024,{len:"A url cannot have more than 1024 characters"}),
    shortCode:z.string({message:"Short Code is Required"}).trim().min(3,{message:"Short code cannot be less than 3 chars"}).max(30,{message:"can not be greater than 30 chars"})
})