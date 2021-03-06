import User from '../models/User'
import * as Yup from 'yup';

class UserController{
    async store(req, res){
        const schema= Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        })

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: "erro na validação"})
        }

        const UserExists = await User.findOne({ where : { email: req.body.email}})

        if(UserExists){
            return res.status(400).json({erro: "Usuário já existente"})
        }

        const { id, name, email, provider } = await User.create(req.body)
        
        return res.json({
            id, 
            name, 
            email, 
            provider 
        });
    }

    async update(req,res){
        const schema= Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            Password: Yup.string()
                .min(6)
                .when('oldPassword',(oldPassword, field)=>{
                    return oldPassword ? field.required() : field;
                }),
            confirmPassword: Yup.string().when('password',(password, field)=>{
                return password ? field.required().oneOf([Yup.ref('password')]) : field;
            })
        })

        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: "erro na validação"})
        }

        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);
        console.log(user);

        if(email && email != user.email){
            const UserExists = await User.findOne({ where : { email }})

            if(UserExists){
                return res.status(400).json({erro: "Usuário já existente"})
            }
        }

        if(oldPassword && !(await user.checkPassword(oldPassword))){
            return res.status(401).json( { error: "password doesnot match"} )
        }
        
        const { id, name, provider } = await user.update(req.body);

        return res.json({
            id, 
            name, 
            email, 
            provider 
        });
    }
}

export default new UserController();