import prisma from "@/app/libs/prismadb";

import getSession from "@/app/actions/getSession";
import { FullUserLetter } from "@/app/types";

export const getUsers = async () => {
  const session = await getSession();
  

  if (!session?.user?.email) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });
    
    return users;
  } catch (error) {
    console.log(error);
    
    return [];
  }
};

export const getUserByLetter = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return [];
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });

    const usersGroupByInitialLetter: FullUserLetter = {};
    users.forEach((user) => {
      const initialLetter: string = user.name?.charAt(0).toUpperCase() || "";
      if (!usersGroupByInitialLetter[initialLetter]) {
        usersGroupByInitialLetter[initialLetter] = [];
      }
      usersGroupByInitialLetter[initialLetter].push(user);
    });

    return usersGroupByInitialLetter;
  } catch (error) {
    console.log(error);
    return [];
  }
};
