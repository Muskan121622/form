import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// === Save or Update Form ===
export const saveOrUpdateForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id,
        userId, 
      name,
      email,
      address1,
      address2,
      city,
      state,
      zipcode
    } = req.body;
if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }  

    // ✅ Prevent duplicate email submission
    if (!id) {  // Only check for duplicates when creating a new form
      const existingUser = await prisma.userForm.findFirst({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({ error: "This email has already been used to submit the form." });
        return;
      }
    }



    let userForm;

    if (id) {
      userForm = await prisma.userForm.update({
        where: { id },
        data: {
          name,
          email,
          address1,
          address2,
          city,
          state,
          zipcode,
         
             user: {
      connect: { id: userId }, // ✅ Connect UserForm to a User
    },
         
        },
        
      });
    } else {
      userForm = await prisma.userForm.create({
        data: {
          name,
          email,
          address1,
          address2,
          city,
          state,
          zipcode,
          
           user: {
        connect: { id: userId },
      },
         
        },
      
      });
    }

    res.status(200).json(userForm); // don't `return` this
  } catch (error:unknown) {
    
  const err = error as Error;
    console.error("Error saving form:", err.message);
    res.status(500).json({ error: "Failed to save form data", details: err.message  });
  }
};

// === Get Form by ID ===
export const getFormById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const userForm = await prisma.userForm.findUnique({
      where: { id },
       include: {
        projects: true,
      },
      
    });

    if (!userForm) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    res.status(200).json(userForm);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "Failed to fetch form data" });
  }
};

export const savePage2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, isStudying, institution } = req.body;

    if (!id) {
      res.status(400).json({ error: "Form id is required to update educational status" });
      return;
    }

    const updatedForm = await prisma.userForm.update({
      where: { id },
      data: {
        isStudying,
        institution: isStudying ? institution : null, // clears if not studying
      },
    });

    res.status(200).json(updatedForm);
  } catch (error) {
    console.error("Error saving page 2:", error);
    res.status(500).json({ error: "Failed to save page 2 data" });
  }
};


// === Save Projects ===
export const saveProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userFormId, projects } = req.body;

    if (!userFormId || !Array.isArray(projects)) {
      res.status(400).json({ error: "Missing userFormId or projects array" });
      return;
    }
    // Validate that the UserForm exists
    const userFormExists = await prisma.userForm.findUnique({ where: { id: userFormId } });
    if (!userFormExists) {
      res.status(404).json({ error: "UserForm not found" });
      return;
    }

    const createdProjects = await Promise.all(
      projects.map((project) =>
        prisma.project.create({
          data: {
            name: project.name,
            description: project.description,
            userForm: {
              connect: { id: userFormId },
            },
          },
        })
      )
    );

    res.status(200).json({ message: "Projects saved", projects: createdProjects });
  } catch (error) {
    console.error("Error saving projects:", error);
    res.status(500).json({ error: "Failed to save projects" });
  }
};
// === Get form by user ID ===
export const getFormByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const userForm = await prisma.userForm.findFirst({
      where: { userId },
      include: {
        projects: true
      }
    });

    if (!userForm) {
      res.status(404).json({ error: "Form not found for this user" });
      return;
    }

    res.status(200).json(userForm);
  } catch (error) {
    console.error("Error fetching form by userId:", error);
    res.status(500).json({ error: "Failed to fetch form data by userId" });
  }
};
