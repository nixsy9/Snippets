package fileStuff;

import java.io.*;
import java.net.*;

public class LoopyDownload {
    public static void main(String[] args) {
        URL url; //represents the location of the file we want to dl.
        URLConnection con;  // represents a connection to the url we want to dl.
        DataInputStream dis;  // input stream that will read data from the file.
        FileOutputStream fos; //used to write data from inut stream to file.
        byte[] fileData;  //byte aray used to hold data from downloaded file.
        try {
            url = new URL("http://icanhascheezburger.files.wordpress.com/2010/06/funny-pictures-cat-is-creepy.jpg");
            con = url.openConnection(); // open the url connection.
            dis = new DataInputStream(con.getInputStream()); // get a data stream from the url connection.
            fileData = new byte[con.getContentLength()]; // determine how many byes the file size is and make array big enough to hold the data
            for (int x = 0; x < fileData.length; x++) { // fill byte array with bytes from the data input stream
                fileData[x] = dis.readByte();
            }
            dis.close(); // close the data input stream
            fos = new FileOutputStream(new File("file.jpg"));  //create an object representing the file we want to save
            fos.write(fileData);  // write out the file we want to save.
            fos.close(); // close the output stream writer
        }
        catch(MalformedURLException m) {
            System.out.println(m);
        }
        catch(IOException io) {
            System.out.println(io);
        }
    }
}