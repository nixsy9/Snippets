package writetodat;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;


public class UserC {
	static String offName;

	public static void setNick(String n) {
		offName = n;
		System.out.println("setNick");
	}

	public static String getNick() {
		UserC.loadInfo();
		
		if(offName == null){
			offName = ("NoName");
		}
		
		return (offName);
	}
	
	static String offPass;

	public static void setoffPass(String m) {
		offPass = m;
		System.out.println("setoffPass");
	}

	public static String getoffPass() {
		UserC.loadInfo();
		
		if(offName == null){
			offName = ("NoName");
		}
		
		return (offName);
	}

	public static void saveInfo() {
		try {
			FileOutputStream userSaveFile = new FileOutputStream("user.dat");
			ObjectOutputStream os = new ObjectOutputStream(userSaveFile);

			os.writeObject(offName);
			os.writeObject(offPass);
			os.close();
		}

		catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void loadInfo() {
		try {
			FileInputStream userSaveFile = new FileInputStream("user.dat");
			ObjectInputStream is = new ObjectInputStream(userSaveFile);

			offName = (String) is.readObject();
			offPass = (String) is.readObject();
			is.close();
			System.out.println("Loaded OffUser");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}


