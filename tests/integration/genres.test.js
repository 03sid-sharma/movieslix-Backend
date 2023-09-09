const request=require('supertest');
const mongoose = require('mongoose');
const {Genre}=require('../../models/genre');
const {User}=require('../../models/user');

let server;

describe('/api/genres',()=>{
    beforeEach(() => { server = require('../../index'); })
    afterEach(async() => { 
        await server.close(); 
        await Genre.deleteMany({});
    });

    describe('GET /',() => {
        it('should return all genres', async ()=>{
            await Genre.collection.insertMany([
                {name:'genre1'},
                {name:'genre2'},
            ]);
            
            const res = await request(server).get('/api/genres');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
            
        });
    });

    describe('GET /:id',() => {
        it('should return genre if valid id is passed',async()=>{
            const genre = new Genre({name:'genre1'});           
            await genre.save();

            const res = await request(server).get('/api/genres/'+genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name',genre.name);    
        });

        it('should return 404 if invalid id is passed',async()=>{
            const res = await request(server).get('/api/genres/1');
            
            expect(res.status).toBe(404); 
        });

        it('should return 404 if no genre with given id exist',async()=>{
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/'+id);
            
            expect(res.status).toBe(404); 
        });

    });

    describe('POST /',() => {

        // Define

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token',token)
                .send({name});
        }

        beforeEach(() => {
            token=new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();
            
            expect(res.status).toBe(401);   
        });

        it('should return 400 if genre is less than 5 characters', async() => {
            name = '1234';
            
            const res = await exec();
            
            expect(res.status).toBe(400);   
        });

        it('should return 400 if genre is more than 5 characters', async() => {

            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);   
        });

        it('should save the genre if it is valid', async() => { 
            await exec();

            const genre=await Genre.find({name:'genre1'});
            
            expect(genre).not.toBeNull();   
        });

        it('should return the genre if it is valid', async() => { 
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','genre1');      
        });      
    });

    describe("DELETE /", () => {
        let token;
        let objectId = "";
    
        beforeEach(() => {
          token = new User({ isAdmin: true }).generateAuthToken();
        });
    
        const exec = () => {
          return request(server)
            .delete(`/api/genres/${objectId}`)
            .set("x-auth-token", token);
        };
    
        it("should return 404 error if we supply an invalid object id parameter", async () => {
          const res = await exec();
          expect(res.status).toBe(404);
        });
    
        it("should return 404 error if we supply a valid objectId that does not belong to any existing genre", async () => {
          objectId = new mongoose.Types.ObjectId();
          const res = await exec();
          expect(res.status).toBe(404);
        });
    
        it("should return the deleted genre if the delete was successful", async () => {
          objectId = new mongoose.Types.ObjectId();
          const schema = {
            _id: objectId.toHexString(),
            name: "genre1"
          };
          const genre = await new Genre(schema).save();
          const res = await exec();
          expect(res.status).toBe(200);
          expect(res.body).toMatchObject(schema);
        });
    });
    
    describe("PUT /", () => {
        let token, updateName;
        let objectId;
        let updateSchema;
    
        beforeEach(() => {
          token = new User({ isAdmin: true }).generateAuthToken();
          updateName = "genre2";
          objectId = new mongoose.Types.ObjectId();
        });
    
        const exec = () => {
          return request(server)
            .put(`/api/genres/${objectId}`)
            .set("x-auth-token", token)
            .send({ name: updateName });
        };
    
        it("should return error 400 if genre name is less than 3 characters", async () => {
          updateName = "12";
          const res = await exec();
          expect(res.status).toBe(400);
        });
    
        it("should return error 400 if genre name is more than 50 characters", async () => {
          updateName = new Array(52).join("1");
          const res = await exec();
          expect(res.status).toBe(400);
        });
    
        it("should return 404 error if we supply an invalid object id parameter", async () => {
          objectId = "a";
          const res = await exec();
          expect(res.status).toBe(404);
        });
    
        it("should return 404 error if we supply a valid objectId that does not belong to any existing genre", async () => {
          const res = await exec();
          expect(res.status).toBe(404);
        });
    
        it("should return the updated genre if the update was successful", async () => {
          const genre = await new Genre({ name: "genre1", _id: objectId }).save();
          const res = await exec();
          expect(res.status).toBe(200);
          expect(res.body).toMatchObject({
            _id: genre._id.toHexString(),
            name: "genre2"
          });
        });
    
        it("should return 400 error if we try to update genre name to the name of another existing genre", async () => {
          await Genre.collection.insertMany([
            { name: "genre1", _id: objectId },
            { name: updateName }
          ]);
    
          const res = await exec();
          expect(res.status).toBe(400);
          expect(res.text).toContain("exist");
        });
    });
});

afterAll(async () => {
  await mongoose.disconnect();
});